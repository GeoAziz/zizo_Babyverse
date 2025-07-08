import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as paypal from '@paypal/checkout-server-sdk';
import nodemailer from 'nodemailer';

const paypalEnv = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv);

export async function POST(request: NextRequest) {
  console.log('PayPal capture request received');
  const req = { headers: Object.fromEntries(request.headers.entries()) } as any;
  const res = { getHeader() {}, setCookie() {}, setHeader() {} } as any;
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    console.log('Unauthorized capture attempt');
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await request.json();
    console.log('Processing PayPal capture for order:', orderId);
    
    if (!orderId) {
      console.log('Missing orderId in request');
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    // Get order from Firestore
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return NextResponse.json({ message: "Order data not found" }, { status: 404 });
    }

    // Check if order belongs to the authenticated user
    if (orderData.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized access to order" }, { status: 403 });
    }

    // Check if already processed
    if (orderData.status === 'Paid') {
      return NextResponse.json({
        id: orderId,
        totalAmount: orderData.totalAmount,
        status: 'Paid',
        message: 'Order already processed'
      });
    }

    if (!orderData.paypalOrderId) {
      return NextResponse.json({ message: "PayPal order ID not found" }, { status: 400 });
    }

    // Capture PayPal payment
    const request_capture = new paypal.orders.OrdersCaptureRequest(orderData.paypalOrderId);
    // PayPal capture request doesn't need a body for basic capture
    
    const capture: any = await paypalClient.execute(request_capture);

    if (capture.result.status === 'COMPLETED') {
      const captureId = capture.result.purchase_units[0]?.payments?.captures?.[0]?.id;
      
      console.log(`PayPal payment captured successfully for order ${orderId}, capture ID: ${captureId}`);
      
      // Update order status
      const updateData = {
        status: 'Paid',
        paypalCaptureId: captureId,
        paymentCompletedAt: new Date(),
        updatedAt: new Date(),
      };

      await orderDoc.ref.update(updateData);

      // Clear user's cart
      try {
        await db.collection('carts').doc(session.user.id).delete();
      } catch (cartError) {
        console.warn('Failed to clear cart:', cartError);
        // Don't fail the whole operation if cart clearing fails
      }

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(
          orderData.shippingAddress.email,
          { ...orderData, id: orderId },
          orderId
        );
      } catch (emailError) {
        console.warn('Failed to send confirmation email:', emailError);
        // Don't fail the operation if email fails
      }

      // Log successful payment
      console.log(`PayPal payment captured successfully for order ${orderId}, capture ID: ${captureId}`);

      return NextResponse.json({
        id: orderId,
        totalAmount: orderData.totalAmount,
        status: 'Paid',
        paypalCaptureId: captureId,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
      });
    } else {
      // Handle failed capture
      await orderDoc.ref.update({
        status: 'PaymentFailed',
        paypalCaptureError: capture.result.status,
        updatedAt: new Date(),
      });

      return NextResponse.json({ 
        message: `Payment capture failed with status: ${capture.result.status}` 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('PayPal capture error details:', {
      message: error.message,
      stack: error.stack,
      orderId: request.json().catch(() => ({})).then(body => body.orderId) || 'unknown'
    });
    
    // Try to update order with error status if we have the orderId
    const body = await request.json().catch(() => ({}));
    if (body.orderId) {
      try {
        const orderDoc = await db.collection('orders').doc(body.orderId).get();
        if (orderDoc.exists) {
          await orderDoc.ref.update({
            status: 'PaymentFailed',
            paymentError: error.message,
            updatedAt: new Date(),
          });
        }
      } catch (updateError) {
        console.error("Failed to update order with error status:", updateError);
      }
    }

    return NextResponse.json({ 
      message: "Failed to capture payment",
      error: error.message 
    }, { status: 500 });
  }
}

// Email sending function
async function sendOrderConfirmationEmail(email: string, order: any, orderId: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const itemsList = order.items.map((item: any) => 
      `<li style="margin-bottom: 10px;">
        <strong>${item.product.name}</strong> - Qty: ${item.quantity} - KSH ${(item.product.price * item.quantity * 100).toFixed(2)}
      </li>`
    ).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #4c51bf; text-align: center; margin-bottom: 30px;">🚀 Order Confirmed!</h1>
          
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2d3748; margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Total Amount:</strong> KSH ${(order.totalAmount * 100).toFixed(2)}</p>
            <p><strong>Status:</strong> <span style="color: #48bb78; font-weight: bold;">Confirmed & Paid</span></p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #2d3748;">Items Ordered:</h3>
            <ul style="list-style-type: none; padding: 0;">
              ${itemsList}
            </ul>
          </div>

          <div style="background: #edf2f7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin-top: 0;">Shipping Address:</h3>
            <p style="margin: 5px 0;">${order.shippingAddress.fullName}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
          </div>

          <div style="background: #bee3f8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #2c5282;">📦 What's Next?</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #2c5282;">
              <li>We're preparing your cosmic package</li>
              <li>You'll receive tracking information within 24 hours</li>
              <li>Estimated delivery: 1-5 business days</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #718096; font-size: 14px;">
              Thank you for choosing Zizo BabyVerse! 🌟<br>
              Need help? Contact us at <a href="mailto:support@zizobabyverse.com" style="color: #4c51bf;">support@zizobabyverse.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Zizo BabyVerse" <no-reply@zizobabyverse.com>',
      to: email,
      subject: `🚀 Order Confirmation #${orderId} - Zizo BabyVerse`,
      html: htmlContent,
    });

    console.log(`Order confirmation email sent to ${email} for order ${orderId}`);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2023-10-16' as any 
});

export async function GET(request: NextRequest) {
  console.log('Stripe verification request received');
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log('Unauthorized verification attempt');
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    console.log('Processing Stripe verification for session:', sessionId);
    
    if (!sessionId) {
      console.log('Missing session_id in request');
      return NextResponse.json({ message: "Session ID is required" }, { status: 400 });
    }

    // Retrieve the checkout session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ 
        message: "Payment not completed" 
      }, { status: 400 });
    }

    const orderId = stripeSession.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ message: "Order ID not found in session" }, { status: 400 });
    }

    // Get order from Firestore
    const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
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
      console.log(`Order ${orderId} already processed`);
      return NextResponse.json({
        id: orderId,
        totalAmount: orderData.totalAmount,
        status: 'Paid',
        message: 'Order already processed'
      });
    }

    console.log(`Stripe payment verified for order ${orderId}, payment intent: ${stripeSession.payment_intent}`);
    
    // Update order status
    const updateData = {
      status: 'Paid',
      paymentIntentId: typeof stripeSession.payment_intent === 'string' 
        ? stripeSession.payment_intent 
        : stripeSession.payment_intent?.id,
      paymentCompletedAt: new Date(),
      updatedAt: new Date(),
    };

    await orderDoc.ref.update(updateData);

    // Clear user's cart
    try {
      await admin.firestore().collection('carts').doc(session.user.id).delete();
      console.log(`Cart cleared for user ${session.user.id}`);
    } catch (cartError) {
      console.warn('Failed to clear cart:', cartError);
      // Don't fail the whole operation if cart clearing fails
    }

    console.log(`Stripe payment verified successfully for order ${orderId}`);

    return NextResponse.json({
      id: orderId,
      totalAmount: orderData.totalAmount,
      status: 'Paid',
      paymentIntentId: updateData.paymentIntentId,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
    });

  } catch (error: any) {
    console.error('Stripe verification error details:', {
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json({ 
      message: "Failed to verify payment",
      error: error.message 
    }, { status: 500 });
  }
}

// Email sending function (same as PayPal)
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
            <p><strong>Payment Method:</strong> Credit Card</p>
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

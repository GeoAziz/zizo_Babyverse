import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Define OrderStatus type
type OrderStatus = 'Pending' | 'Processing' | 'PodPacked' | 'Dispatched' | 'InTransit' | 'Delivered' | 'Cancelled';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    // Get order from Firestore
    const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
    }

    // Check if order belongs to the authenticated user or if user is admin
    const userRole = (session.user as any).role;
    if (orderData.userId !== session.user.id && userRole !== 'ADMIN') {
      return NextResponse.json({ message: "Order not found or not authorized" }, { status: 404 });
    }

    // Return order with ID and formatted timestamps
    const order = {
      id: orderId,
      ...orderData,
      createdAt: orderData.createdAt?.toDate ? orderData.createdAt.toDate().toISOString() : orderData.createdAt,
      updatedAt: orderData.updatedAt?.toDate ? orderData.updatedAt.toDate().toISOString() : orderData.updatedAt,
      paymentCompletedAt: orderData.paymentCompletedAt?.toDate ? orderData.paymentCompletedAt.toDate().toISOString() : orderData.paymentCompletedAt,
    };

    return NextResponse.json(order);

  } catch (error: any) {
    console.error("Get order error:", error);
    
    return NextResponse.json({ 
      message: "Failed to fetch order",
      error: error.message 
    }, { status: 500 });
  }
}

// PUT to update order status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user as { role: 'ADMIN' | 'USER' | string }).role !== 'ADMIN'
  ) {
    return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
  }

  const orderId = params.id;
  try {
    const body = await request.json();
    const { status } = body; // Expecting { status: "NewStatus" } in body

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ message: "Status is required and must be a string" }, { status: 400 });
    }
      // Validate status against allowed OrderStatus enum/values
    const validStatuses: OrderStatus[] = ['Pending', 'Processing', 'PodPacked', 'Dispatched', 'InTransit', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status as OrderStatus)) {
        return NextResponse.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    // Update order in Firestore
    const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    await orderDoc.ref.update({
      status: status as OrderStatus,
      updatedAt: new Date(),
    });

    const updatedOrderData = await orderDoc.ref.get();
    const updatedOrder = {
      id: orderId,
      ...updatedOrderData.data(),
      createdAt: updatedOrderData.data()?.createdAt.toDate().toISOString(),
      updatedAt: updatedOrderData.data()?.updatedAt.toDate().toISOString(),
    };

    // Send status update email to customer if needed
    if (['Dispatched', 'InTransit', 'Delivered'].includes(status)) {
      try {
        const orderData = updatedOrderData.data();
        if (orderData?.shippingAddress?.email) {
          await sendOrderStatusUpdateEmail(
            orderData.shippingAddress.email,
            orderId,
            status,
            orderData
          );
        }
      } catch (emailError) {
        console.warn('Failed to send status update email:', emailError);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error(`Error updating order ${orderId}:`, error);
    return NextResponse.json({ message: "Failed to update order status" }, { status: 500 });
  }
}

// Email function for status updates
async function sendOrderStatusUpdateEmail(email: string, orderId: string, status: string, orderData: any) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const statusMessages = {
      'Processing': 'Your order is being processed',
      'PodPacked': 'Your order has been packed and is ready for dispatch',
      'Dispatched': 'Your order has been dispatched!',
      'InTransit': 'Your order is on its way to you',
      'Delivered': 'Your order has been delivered!'
    };

    const statusEmojis = {
      'Processing': '⚙️',
      'PodPacked': '📦',
      'Dispatched': '🚚',
      'InTransit': '🛣️',
      'Delivered': '🎉'
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #4c51bf; text-align: center; margin-bottom: 30px;">
            ${statusEmojis[status as keyof typeof statusEmojis]} Order Update
          </h1>
          
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2d3748; margin-top: 0;">Order #${orderId}</h2>
            <p style="font-size: 18px; color: #2c5282; font-weight: bold;">
              ${statusMessages[status as keyof typeof statusMessages]}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #718096; font-size: 14px;">
              Thank you for choosing Zizo BabyVerse! 🌟<br>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile?tab=orders" style="color: #4c51bf;">Track your order</a>
            </p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Zizo BabyVerse" <no-reply@zizobabyverse.com>',
      to: email,
      subject: `${statusEmojis[status as keyof typeof statusEmojis]} Order Update - #${orderId}`,
      html: htmlContent,
    });

    console.log(`Status update email sent for order ${orderId} with status ${status}`);
  } catch (error) {
    console.error('Failed to send status update email:', error);
    throw error;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    // Fix getServerSession signature
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status, trackingNumber, notes } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ message: "Order ID and status are required" }, { status: 400 });
    }

    // Valid status options
    const validStatuses = [
      'Pending',
      'Paid', 
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
      'Refunded',
      'Payment Failed'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        message: "Invalid status", 
        validStatuses 
      }, { status: 400 });
    }

    // Get order from Firestore
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
    }

    // Check if user owns the order (or is admin - implement admin check if needed)
    if (orderData.userId !== session.user.id) {
      // TODO: Add admin role check here
      return NextResponse.json({ message: "Unauthorized access to order" }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Add optional fields
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (notes) {
      updateData.notes = notes;
    }

    // Add status-specific timestamps
    switch (status) {
      case 'Paid':
        updateData.paidAt = new Date();
        break;
      case 'Processing':
        updateData.processingAt = new Date();
        break;
      case 'Shipped':
        updateData.shippedAt = new Date();
        if (trackingNumber) {
          updateData.trackingNumber = trackingNumber;
        }
        break;
      case 'Delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'Cancelled':
        updateData.cancelledAt = new Date();
        break;
      case 'Refunded':
        updateData.refundedAt = new Date();
        break;
    }

    // Update order
    await orderDoc.ref.update(updateData);

    // Send status update email if status changed significantly
    const significantStatuses = ['Shipped', 'Delivered', 'Cancelled'];
    if (significantStatuses.includes(status)) {
      try {
        await sendStatusUpdateEmail(orderData, orderId, status, trackingNumber);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the operation if email fails
      }
    }

    console.log(`Order ${orderId} status updated to: ${status}`);

    return NextResponse.json({
      success: true,
      orderId,
      status,
      trackingNumber,
      updatedAt: updateData.updatedAt,
      message: `Order status updated to ${status}`
    });

  } catch (error: any) {
    console.error("Order status update error:", error);
    
    return NextResponse.json({ 
      message: "Failed to update order status",
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fix getServerSession signature
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    // Get order from Firestore
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
    }

    // Check if user owns the order
    if (orderData.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized access to order" }, { status: 403 });
    }

    return NextResponse.json({
      id: orderId,
      status: orderData.status,
      trackingNumber: orderData.trackingNumber,
      notes: orderData.notes,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      paidAt: orderData.paidAt,
      processingAt: orderData.processingAt,
      shippedAt: orderData.shippedAt,
      deliveredAt: orderData.deliveredAt,
    });

  } catch (error: any) {
    console.error("Get order status error:", error);
    
    return NextResponse.json({ 
      message: "Failed to get order status",
      error: error.message 
    }, { status: 500 });
  }
}

// Email notification function
async function sendStatusUpdateEmail(orderData: any, orderId: string, status: string, trackingNumber?: string) {
  try {
    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/email/status-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: orderData.shippingAddress.email,
        orderData: {
          id: orderId,
          status,
          trackingNumber,
          totalAmount: orderData.totalAmount,
          shippingAddress: orderData.shippingAddress,
        }
      }),
    });

    if (!emailResponse.ok) {
      console.error('Failed to send status update email:', await emailResponse.text());
    }
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}

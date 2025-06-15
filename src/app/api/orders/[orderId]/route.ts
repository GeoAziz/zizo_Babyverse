
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role } from '@prisma/client';


export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = params;

  try {
    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        // Ensure user can only fetch their own orders unless they are admin
        ...( (session.user as any).role !== 'ADMIN' && { userId: session.user.id } )
      },
      include: {
        items: true, // OrderItems already include name and price
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found or not authorized" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 });
  }
}

// Example: PUT to update order status (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
  }

  const { orderId } = params;
  try {
    const body = await request.json();
    const { status } = body; // Expecting { status: "NewStatus" } in body

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ message: "Status is required and must be a string" }, { status: 400 });
    }
    
    // Potentially validate status against allowed OrderStatus enum/values
    const validStatuses = ['Pending', 'Processing', 'Pod Packed', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }


    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error(`Error updating order ${orderId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update order status" }, { status: 500 });
  }
}

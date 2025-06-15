
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email("Valid email is required"),
});

const CreateOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  // paymentMethodId: z.string().min(1, "Payment method ID is required"), // For real payment
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          // No need to include product again if name/price are on OrderItem
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { shippingAddress } = validation.data;
    const userId = session.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ message: "Your cart is empty." }, { status: 400 });
    }

    // Basic stock check (in a real scenario, this should be a transaction)
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${item.product.name}. Only ${item.product.stock} available.` }, { status: 400 });
      }
    }
    
    const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) + 5.99; // 5.99 mock shipping

    // In a real application, process payment here with Stripe, PayPal, etc.
    // const paymentIntent = await stripe.paymentIntents.create({...});
    // If payment fails, return error.

    // Create order and order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress: shippingAddress as any, // Cast to Json type, Prisma handles validation
          status: 'Pending', // Initial status
          paymentMethod: 'Mock Card', // Placeholder
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price, // Price at the time of order
              name: item.product.name,   // Name at the time of order
            })),
          },
        },
        include: { items: true },
      });

      // Update stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return createdOrder;
    });

    // Conceptually, send order confirmation email here.

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    // Handle specific errors like insufficient stock if not caught earlier
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().min(1),
  }),
  paymentMethod: z.object({
    type: z.enum(['card', 'mpesa']),
    cardNumber: z.string().optional(),
    expiryMonth: z.string().optional(),
    expiryYear: z.string().optional(),
    cvv: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid checkout data", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Get user's cart
    // Implement your own logic to get the cart from the database

    // if (!cart || cart.items.length === 0) {
    //   return NextResponse.json(
    //     { message: "Cart is empty" },
    //     { status: 400 }
    //   );
    // }

    // Calculate total
    // const total = cart.items.reduce(
    //   (sum: number, item: { product: { price: number }; quantity: number }) => sum + (item.product.price * item.quantity),
    //   0
    // );

    // Create order
    // const order = await prisma.order.create({
    //   data: {
    //     userId: session.user.id,
    //     total,
    //     status: 'pending',
    //     shippingAddress: validation.data.shippingAddress,
    //     paymentMethod: validation.data.paymentMethod,
    //     items: {
    //       create: cart.items.map((item: { productId: string; quantity: number; product: { price: number } }) => ({
    //         productId: item.productId,
    //         quantity: item.quantity,
    //         price: item.product.price,
    //       })),
    //     },
    //   },
    //   include: {
    //     items: true,
    //   },
    // });

    // Clear the cart
    // await prisma.cart.delete({
    //   where: { userId: session.user.id },
    // });

    // Update product stock
    // for (const item of cart.items as { productId: string; quantity: number }[]) {
    //   await prisma.product.update({
    //     where: { id: item.productId },
    //     data: {
    //       stock: {
    //         decrement: item.quantity,
    //       },
    //     },
    //   });
    // }

    return NextResponse.json({
      message: "Order created successfully",
      // orderId: order.id,
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { message: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
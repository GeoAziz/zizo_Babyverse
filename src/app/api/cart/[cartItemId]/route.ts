
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

export async function PUT(
  request: Request,
  { params }: { params: { cartItemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { cartItemId } = params;
  if (!cartItemId) {
    return NextResponse.json({ message: "Cart item ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = UpdateCartItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { quantity } = validation.data;
    const userId = session.user.id;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return NextResponse.json({ message: "Cart item not found or not authorized" }, { status: 404 });
    }
    
    if (cartItem.product.stock < quantity) {
        return NextResponse.json({ message: `Not enough stock for ${cartItem.product.name}. Only ${cartItem.product.stock} available.` }, { status: 400 });
    }


    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error(`Error updating cart item ${cartItemId}:`, error);
    return NextResponse.json({ message: "Failed to update cart item" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { cartItemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { cartItemId } = params;
  if (!cartItemId) {
    return NextResponse.json({ message: "Cart item ID is required" }, { status: 400 });
  }

  try {
    const userId = session.user.id;
    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            userId: userId,
        }
    });

    if (!cartItem) {
        return NextResponse.json({ message: "Cart item not found or not authorized" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ message: "Item removed from cart" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting cart item ${cartItemId}:`, error);
    if (error.code === 'P2025') { // Prisma's "Record to delete does not exist"
        return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to remove item from cart" }, { status: 500 });
  }
}

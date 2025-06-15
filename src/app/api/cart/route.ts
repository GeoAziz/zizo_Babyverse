
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';
import type { CartItem as PrismaCartItem, Product } from '@prisma/client';

export interface CartItemWithProduct extends PrismaCartItem {
  product: Product;
}

const AddToCartSchema = z.object({
  productId: z.string().cuid("Invalid product ID."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ message: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = AddToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { productId, quantity } = validation.data;
    const userId = session.user.id;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ message: "Not enough stock available" }, { status: 400 });
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    let savedCartItem;
    if (existingCartItem) {
      // Update quantity if item already exists
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return NextResponse.json({ message: "Not enough stock available for the new total quantity" }, { status: 400 });
      }
      savedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    } else {
      // Create new cart item
      savedCartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: { product: true },
      });
    }

    return NextResponse.json(savedCartItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ message: "Failed to add to cart" }, { status: 500 });
  }
}

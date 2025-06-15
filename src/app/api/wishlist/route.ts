
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const AddToWishlistSchema = z.object({
  productId: z.string().cuid("Invalid product ID."),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: { product: true }, // Include product details
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(wishlistItems.map(item => item.product));
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ message: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = AddToWishlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { productId } = validation.data;

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Check if item already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json({ message: "Product already in wishlist", item: existingItem }, { status: 200 });
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId: productId,
      },
      include: { product: true }
    });

    return NextResponse.json({ message: "Product added to wishlist", item: wishlistItem.product }, { status: 201 });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    // Prisma unique constraint violation
    if ((error as any).code === 'P2002') {
        return NextResponse.json({ message: "Product already in wishlist." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to add to wishlist" }, { status: 500 });
  }
}

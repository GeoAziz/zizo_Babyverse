
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { productId } = params;

  if (!productId) {
    return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
  }

  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
    });
    return NextResponse.json({ message: "Product removed from wishlist" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting product ${productId} from wishlist:`, error);
    if ((error as any).code === 'P2025') { // Prisma error for record not found
      return NextResponse.json({ message: "Wishlist item not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to remove product from wishlist" }, { status: 500 });
  }
}

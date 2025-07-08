import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

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
    const db = admin.firestore();
    // Remove the wishlist item from wishlists/{userId}/items/{productId}
    const wishlistItemRef = db.collection('wishlists')
      .doc(session.user.id)
      .collection('items')
      .doc(productId);
    const docSnap = await wishlistItemRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ message: "Wishlist item not found" }, { status: 404 });
    }
    await wishlistItemRef.delete();
    return NextResponse.json({ message: "Product removed from wishlist" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting product ${productId} from wishlist:`, error);
    return NextResponse.json({ message: "Failed to remove product from wishlist" }, { status: 500 });
  }
}

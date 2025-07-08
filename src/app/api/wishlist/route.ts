import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const AddToWishlistSchema = z.object({
  productId: z.string(),
});

export async function GET(request: Request) {
  // @ts-ignore: Next.js API route context does not provide req/res, so pass undefined
  const session = await getServerSession(undefined, undefined, authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await db
      .collection('wishlists')
      .doc(session.user.id)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .get();

    // Fetch product details for each wishlist item
    const wishlistItems = await Promise.all(snapshot.docs.map(async (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      const productSnap = await db.collection('products').doc(data.productId).get();
      if (!productSnap.exists) return null;
      return { id: productSnap.id, ...productSnap.data() };
    }));

    // Filter out any nulls (products that no longer exist)
    return NextResponse.json(wishlistItems.filter(Boolean));
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ message: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // @ts-ignore: Next.js API route context does not provide req/res, so pass undefined
  const session = await getServerSession(undefined, undefined, authOptions);
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
    const productSnapshot = await db.collection('products').doc(productId).get();
    const product = productSnapshot.data();
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const wishlistItemRef = db
      .collection('wishlists')
      .doc(session.user.id)
      .collection('items')
      .doc(productId);

    // Check if item already in wishlist
    const existingItemSnapshot = await wishlistItemRef.get();
    if (existingItemSnapshot.exists) {
      return NextResponse.json({ message: "Product already in wishlist", item: { id: productId, ...product } }, { status: 200 });
    }

    const wishlistItem = {
      userId: session.user.id,
      productId: productId,
      createdAt: db.FieldValue ? db.FieldValue.serverTimestamp() : undefined,
    };

    await wishlistItemRef.set(wishlistItem);

    return NextResponse.json({ message: "Product added to wishlist", item: { id: productId, ...product } }, { status: 201 });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ message: "Failed to add to wishlist" }, { status: 500 });
  }
}

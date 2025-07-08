import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const AddToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1).default(1),
});

// GET cart items for the logged-in user
export async function GET(request: NextRequest) {
  const session = await getServerSession(request, null, authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const cartRef = db.collection('carts').doc(session.user.id);
    const cartSnap = await cartRef.get();
    if (!cartSnap.exists) {
      return NextResponse.json({ items: [] });
    }
    const cart = cartSnap.data();
    if (!cart || !cart.items) {
      return NextResponse.json({ items: [] });
    }
    // Populate product details for each item
    const items = await Promise.all(
      (cart.items).map(async (item: any) => {
        const productSnap = await db.collection('products').doc(item.productId).get();
        if (!productSnap.exists) return null;
        const product = productSnap.data();
        if (!product) return null;
        return {
          product: { id: productSnap.id, ...product },
          quantity: item.quantity,
        };
      })
    );
    return NextResponse.json({ items: items.filter(Boolean) });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ message: 'Failed to fetch cart' }, { status: 500 });
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  const session = await getServerSession(request, null, authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validation = AddToCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { productId, quantity } = validation.data;
    // Check if product exists and has enough stock
    const productSnap = await db.collection('products').doc(productId).get();
    if (!productSnap.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    const product = productSnap.data();
    if (!product || typeof product.stock !== 'number') {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    if (product.stock < quantity) {
      return NextResponse.json({ message: 'Not enough stock' }, { status: 400 });
    }
    const cartRef = db.collection('carts').doc(session.user.id);
    const cartSnap = await cartRef.get();
    let items: any[] = [];
    if (cartSnap.exists) {
      const cartData = cartSnap.data();
      if (cartData && Array.isArray(cartData.items)) {
        items = cartData.items;
      }
    }
    // Find by productId
    const existingIndex = items.findIndex((item: any) => item && item.productId === productId);
    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ id: uuidv4(), productId, quantity });
    }
    await cartRef.set({ userId: session.user.id, items, updatedAt: new Date() }, { merge: true });
    return NextResponse.json({ message: 'Added to cart' }, { status: 200 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ message: 'Failed to add to cart' }, { status: 500 });
  }
}

// Remove a single item from cart
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(request, null, authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { productId } = body;
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }
    const cartRef = db.collection('carts').doc(session.user.id);
    const cartSnap = await cartRef.get();
    if (!cartSnap.exists) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
    }
    const cartData = cartSnap.data();
    if (!cartData || !Array.isArray(cartData.items)) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 404 });
    }
    const newItems = cartData.items.filter((item: any) => item.productId !== productId);
    await cartRef.set({ ...cartData, items: newItems, updatedAt: new Date() }, { merge: true });
    return NextResponse.json({ message: 'Item removed from cart' }, { status: 200 });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ message: 'Failed to remove item from cart' }, { status: 500 });
  }
}

// Remove all items from cart
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(request, null, authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    await db.collection('carts').doc(session.user.id).delete();
    return NextResponse.json({ message: 'Cart cleared' }, { status: 200 });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ message: 'Failed to clear cart' }, { status: 500 });
  }
}

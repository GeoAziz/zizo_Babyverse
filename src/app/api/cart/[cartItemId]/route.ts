import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const UpdateCartItemSchema = z.object({
  quantity: z.number().min(1),
});

// Update quantity of a cart item
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ cartItemId: string }> }
) {
  const { cartItemId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validation = UpdateCartItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { quantity } = validation.data;
    // Fetch product to check stock
    const productSnap = await admin.firestore().collection('products').doc(cartItemId).get();
    if (!productSnap.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    const product = productSnap.data();
    if (!product) {
      return NextResponse.json({ message: 'Product data missing' }, { status: 404 });
    }
    if (typeof product.stock === 'number' && quantity > product.stock) {
      return NextResponse.json({ message: `Only ${product.stock} in stock.` }, { status: 400 });
    }
    const cartRef = admin.firestore().collection('carts').doc(session.user.id);
    const cartSnap = await cartRef.get();
    if (!cartSnap.exists) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
    }
    let items: any[] = [];
    const cartData = cartSnap.data();
    if (cartData && Array.isArray(cartData.items)) {
      items = cartData.items;
    }
    // Support both id and productId for compatibility
    const itemIndex = items.findIndex((item: any) => item && (item.id === cartItemId || item.productId === cartItemId));
    if (itemIndex === -1) {
      return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });
    }
    items[itemIndex].quantity = quantity;
    await cartRef.set({ items, updatedAt: new Date() }, { merge: true });
    // Return updated item for optimistic UI
    let updatedItem = {
      id: cartItemId,
      product: { id: cartItemId, ...product },
      quantity,
    };
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ message: 'Failed to update cart item' }, { status: 500 });
  }
}

// Remove a single item from cart
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ cartItemId: string }> }
) {
  const { cartItemId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const cartRef = admin.firestore().collection('carts').doc(session.user.id);
    const cartSnap = await cartRef.get();
    if (!cartSnap.exists) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
    }
    let items: any[] = [];
    const cartData = cartSnap.data();
    if (cartData && Array.isArray(cartData.items)) {
      items = cartData.items;
    }
    // Remove by id or productId for compatibility
    items = items.filter((item: any) => item && item.id !== cartItemId && item.productId !== cartItemId);
    await cartRef.set({ items, updatedAt: new Date() }, { merge: true });
    return NextResponse.json({ message: 'Cart item removed' }, { status: 200 });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json({ message: 'Failed to remove cart item' }, { status: 500 });
  }
}

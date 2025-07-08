import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const ApplyPromoSchema = z.object({
  code: z.string().trim().min(1),
});

// Type guard for promo object
function isPromo(obj: any): obj is { type: string; value: number; expiresAt?: any; minCartValue?: number } {
  return obj && typeof obj.type === 'string' && typeof obj.value === 'number';
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validation = ApplyPromoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid promo code.' }, { status: 400 });
    }
    const { code } = validation.data;
    // Fetch promo from Firestore (collection: promos, doc id: code.toUpperCase())
    const promoSnap = await admin.firestore().collection('promos').doc(code.toUpperCase()).get();
    if (!promoSnap.exists) {
      return NextResponse.json({ message: 'Promo code not found.' }, { status: 404 });
    }
    const promo = promoSnap.data();
    if (!isPromo(promo)) {
      return NextResponse.json({ message: 'Invalid promo data.' }, { status: 400 });
    }
    // Check expiration
    if (promo.expiresAt && promo.expiresAt.toDate && promo.expiresAt.toDate() < new Date()) {
      return NextResponse.json({ message: 'Promo code has expired.' }, { status: 400 });
    }
    // Fetch user's cart to calculate discount
    const cartRef = admin.firestore().collection('carts').doc(session.user.id);
    const cartSnap = await cartRef.get();
    if (!cartSnap.exists) {
      return NextResponse.json({ message: 'Cart not found.' }, { status: 404 });
    }
    const cartData = cartSnap.data();
    const items = Array.isArray(cartData?.items) ? cartData.items : [];
    const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);
    // Check minimum cart value if required
    if (promo.minCartValue && subtotal < promo.minCartValue) {
      return NextResponse.json({ message: `Minimum cart value for this promo is KSH ${(promo.minCartValue * 100).toFixed(2)}.` }, { status: 400 });
    }
    // Calculate discount
    let discount = 0;
    if (promo.type.toLowerCase() === 'percentage') {
      discount = subtotal * (promo.value / 100);
    } else if (promo.type.toLowerCase() === 'fixed') {
      discount = promo.value;
    }
    // Clamp discount to subtotal
    if (discount > subtotal) discount = subtotal;
    return NextResponse.json({ promo: { code: promoSnap.id, ...promo }, discount }, { status: 200 });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return NextResponse.json({ message: 'Failed to apply promo code.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface FirestoreOrder {
  id: string;
  userId: string;
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl?: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
  };
  paymentMethod: 'stripe' | 'paypal';
  createdAt: any;
  updatedAt: any;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = admin.firestore();
    let query = db.collection('orders').orderBy('createdAt', 'desc');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const ordersSnapshot = await query.limit(limit).offset(offset).get();
    const orders: FirestoreOrder[] = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as FirestoreOrder[];

    // Get user details for each order
    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order: FirestoreOrder) => {
        try {
          const userDoc = await db.collection('users').doc(order.userId).get();
          const userData = userDoc.data();
          return {
            ...order,
            user: userData ? {
              name: userData.name || null,
              email: userData.email || null,
            } : null
          };
        } catch (error) {
          console.warn(`Failed to fetch user data for order ${order.id}:`, error);
          return {
            ...order,
            user: null
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      orders: ordersWithUserDetails,
      pagination: {
        limit,
        offset,
        total: ordersSnapshot.size
      }
    });

  } catch (error: any) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    }, { status: 500 });
  }
}
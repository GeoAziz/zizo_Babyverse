import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface FirestoreUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string | null;
  createdAt: any;
  updatedAt: any;
}

export async function GET(request: NextRequest) {
  try {
    // Convert NextRequest to Node.js req and res objects for getServerSession
    const { headers } = request;
    // @ts-ignore
    const req = { headers };
    // @ts-ignore
    const res = { getHeader() {}, setCookie() {}, setHeader() {} };
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const usersSnapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    
    const users: FirestoreUser[] = usersSnapshot.docs.map((doc: FirebaseFirestore.DocumentData) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as FirestoreUser[];

    // Get order counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user: FirestoreUser) => {
        try {
          const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', user.id)
            .get();
          
          const userOrders = ordersSnapshot.docs.map((doc: FirebaseFirestore.DocumentData) => doc.data());
          const totalSpent = userOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

          let lastOrderDate = null;
          if (userOrders.length > 0) {
            const sortedOrders = userOrders.sort((a: any, b: any) => {
              const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
              const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt || 0);
              return dateB.getTime() - dateA.getTime();
            });
            const lastOrder = sortedOrders[0];
            lastOrderDate = lastOrder.createdAt?.toDate?.()?.toISOString() || null;
          }

          return {
            ...user,
            totalOrders: userOrders.length,
            totalSpent,
            lastOrderDate,
            status: userOrders.length > 0 ? 'active' : 'inactive'
          };
        } catch (error) {
          console.warn(`Failed to fetch orders for user ${user.id}:`, error);
          return {
            ...user,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: null,
            status: 'inactive'
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithStats
    });

  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    }, { status: 500 });
  }
}
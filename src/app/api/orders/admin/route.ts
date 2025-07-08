import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// This route is specifically for admins to fetch all orders
export async function GET(request: Request) {
  // Create mock req and res objects for getServerSession
  const req = { headers: Object.fromEntries(request.headers.entries()) } as any;
  const res = { getHeader() {}, setCookie() {}, setHeader() {} } as any;
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: "Forbidden: Admins only." }, { status: 403 });
  }

  try {
    const ordersSnap = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = await Promise.all(
      ordersSnap.docs.map(async (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        const order = doc.data();
        // Fetch user info
        let user = null;
        if (order.userId) {
          const userSnap = await db.collection('users').doc(order.userId).get();
          user = userSnap.exists ? userSnap.data() : null;
        }
        return { id: doc.id, ...order, user };
      })
    );
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
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
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: any;
}

interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
}

interface FirestoreProduct {
  id: string;
  name: string;
  stock: number;
}

// Production-safe API route for dashboard data
export async function GET() {
  try {
    // Use db from firebaseAdmin import

    // Fetch orders
    const ordersSnap = await db.collection('orders').get();
    const orders = ordersSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<any>) => ({ id: doc.id, ...doc.data() }));

    // Fetch users
    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<any>) => ({ id: doc.id, ...doc.data() }));

    // Fetch products
    const productsSnap = await db.collection('products').get();
    const products = productsSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<any>) => ({ id: doc.id, ...doc.data() }));

    // Total orders, revenue, users, products
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const totalUsers = users.length;
    const totalProducts = products.length;

    // Orders by status
    const ordersByStatus = orders.reduce((acc: Record<string, number>, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent orders (last 5)
    const recentOrders = orders
      .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      .slice(0, 5);

    // Recent users (last 5)
    const recentUsers = users
      .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      .slice(0, 5);

    // Monthly revenue (last 6 months)
    const now = new Date();
    const monthlyRevenue: Array<{ month: string; revenue: number; orders: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthOrders = orders.filter((o: any) => {
        const created = o.createdAt?.toDate?.() || new Date(0);
        return created.getFullYear() === month.getFullYear() && created.getMonth() === month.getMonth();
      });
      const revenue = monthOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      monthlyRevenue.push({ month: monthStr, revenue, orders: monthOrders.length });
    }

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products (by quantity sold)
    const productSales: Record<string, { name: string; sold: number }> = {};
    orders.forEach((o: any) => {
      (o.items || []).forEach((item: any) => {
        const pid = item.product?.id;
        if (!pid) return;
        if (!productSales[pid]) productSales[pid] = { name: item.product?.name || '', sold: 0 };
        productSales[pid].sold += item.quantity || 0;
      });
    });
    const topProducts = Object.entries(productSales)
      .sort((a: [string, { name: string; sold: number }], b: [string, { name: string; sold: number }]) => b[1].sold - a[1].sold)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    // Low stock products
    const lowStockProducts = products.filter((p: any) => (p.stock ?? 0) < 5).length;
    const inventory = {
      lowStock: lowStockProducts,
      items: products.filter((p: any) => (p.stock ?? 0) < 5)
    };

    return Response.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts,
        ordersByStatus,
        recentOrders,
        recentUsers,
        monthlyRevenue,
        averageOrderValue,
        topProducts,
        lowStockProducts,
        inventory
      }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
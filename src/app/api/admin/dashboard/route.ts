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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const db = admin.firestore();
    
    // Fetch all data in parallel
    const [ordersSnapshot, usersSnapshot, productsSnapshot] = await Promise.all([
      db.collection('orders').get(),
      db.collection('users').get(),
      db.collection('products').get()
    ]);

    const orders: FirestoreOrder[] = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    })) as FirestoreOrder[];

    const users: FirestoreUser[] = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    })) as FirestoreUser[];

    const products: FirestoreProduct[] = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreProduct[];

    // Calculate dashboard metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: FirestoreOrder) => sum + (order.totalAmount || 0), 0);
    const totalUsers = users.length;
    const totalProducts = products.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((order: FirestoreOrder) => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    // Recent orders (last 10)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((order: FirestoreOrder) => ({
        id: order.id,
        totalAmount: order.totalAmount || 0,
        status: order.status || 'Unknown',
        userId: order.userId || 'Unknown',
        createdAt: order.createdAt,
      }));

    // Recent users (last 10)
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((user: FirestoreUser) => ({
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.email || 'No email',
        role: user.role || 'USER',
        createdAt: user.createdAt,
      }));

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter((order: FirestoreOrder) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthRevenue = monthOrders.reduce((sum: number, order: FirestoreOrder) => sum + (order.totalAmount || 0), 0);
      
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length
      });
    }

    // Top products by sales
    const productSales: Record<string, any> = {};
    orders.forEach((order: FirestoreOrder) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.product?.id || 'unknown';
          const productName = item.product?.name || 'Unknown Product';
          const quantity = item.quantity || 1;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              name: productName,
              totalSold: 0,
              revenue: 0
            };
          }
          
          productSales[productId].totalSold += quantity;
          productSales[productId].revenue += (item.product?.price || 0) * quantity;
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([productId, data]: [string, any]) => ({ productId, ...data }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // Low stock products
    const lowStockThreshold = 10;
    const lowStockProducts = products.filter((product: FirestoreProduct) => (product.stock || 0) <= lowStockThreshold);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts,
        averageOrderValue,
        ordersByStatus,
        recentOrders,
        recentUsers,
        monthlyRevenue,
        topProducts,
        lowStockProducts: lowStockProducts.length,
        inventory: {
          lowStock: lowStockProducts.length,
          items: lowStockProducts.slice(0, 10).map((product: FirestoreProduct) => ({
            id: product.id,
            name: product.name || 'Unknown Product',
            stock: product.stock || 0
          }))
        }
      }
    });

  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    }, { status: 500 });
  }
}
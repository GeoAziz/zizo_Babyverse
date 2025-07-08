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
      category?: string;
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

    // Calculate analytics
    const totalRevenue = orders.reduce((sum: number, order: FirestoreOrder) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by month (last 12 months)
    const revenueByMonth = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter((order: FirestoreOrder) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthRevenue = monthOrders.reduce((sum: number, order: FirestoreOrder) => sum + (order.totalAmount || 0), 0);
      
      revenueByMonth.push({
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
          const productId = item.productId || item.product?.id || 'unknown';
          const productName = item.product?.name || item.name || 'Unknown Product';
          const quantity = item.quantity || 1;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              name: productName,
              quantity: 0,
              orders: 0,
              revenue: 0
            };
          }
          
          productSales[productId].quantity += quantity;
          productSales[productId].orders += 1;
          productSales[productId].revenue += (item.product?.price || item.price || 0) * quantity;
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]: [string, any]) => ({ productId: id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // User activity analysis
    const userActivity = users.map((user: FirestoreUser) => {
      const userOrders = orders.filter((order: FirestoreOrder) => order.userId === user.id);
      const totalSpent = userOrders.reduce((sum: number, order: FirestoreOrder) => sum + (order.totalAmount || 0), 0);
      
      return {
        userId: user.id,
        name: user.name || 'Unknown User',
        email: user.email || 'No email',
        totalOrders: userOrders.length,
        totalSpent,
        lastOrderDate: userOrders.length > 0 
          ? userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
          : null,
        joinDate: user.createdAt
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    // Category analysis
    const categoryAnalysis: Record<string, any> = {};
    orders.forEach((order: FirestoreOrder) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const category = item.product?.category || 'Unknown';
          if (!categoryAnalysis[category]) {
            categoryAnalysis[category] = {
              orders: 0,
              revenue: 0,
              quantity: 0
            };
          }
          
          categoryAnalysis[category].orders += 1;
          categoryAnalysis[category].revenue += (item.product?.price || item.price || 0) * (item.quantity || 1);
          categoryAnalysis[category].quantity += item.quantity || 1;
        });
      }
    });

    // Low stock products
    const lowStockThreshold = 10;
    const lowStockProducts = products.filter((product: FirestoreProduct) => (product.stock || 0) <= lowStockThreshold);

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders,
        totalUsers,
        averageOrderValue
      },
      revenueByMonth,
      topProducts,
      userActivity: userActivity.slice(0, 20), // Top 20 customers
      categoryAnalysis: Object.entries(categoryAnalysis).map(([name, data]) => ({ name, ...data })),
      inventory: {
        lowStock: lowStockProducts.length,
        items: lowStockProducts.slice(0, 10).map((product: FirestoreProduct) => ({
          name: product.name || 'Unknown Product',
          stock: product.stock || 0,
          id: product.id
        }))
      }
    });

  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    }, { status: 500 });
  }
}
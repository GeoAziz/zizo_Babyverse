// Admin-specific type definitions

export interface AdminOrder {
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
  status: 'Pending' | 'Processing' | 'PodPacked' | 'Dispatched' | 'InTransit' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
  };
  paymentMethod: 'stripe' | 'paypal';
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: { 
    name?: string | null; 
    email?: string | null; 
  };
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | Date | null;
}

export interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: AdminOrder[];
  recentUsers: AdminUser[];
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  lowStockProducts: number;
  inventory: {
    lowStock: number;
    items: Array<{
      id: string;
      name: string;
      stock: number;
    }>;
  };
}

// Utility function to safely format dates
export function safeFormatDate(date: string | Date | null | undefined, formatStr: string = 'PPpp'): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    // Import format dynamically to avoid issues
    const { format } = require('date-fns');
    return format(dateObj, formatStr);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid Date';
  }
}

// Utility function to safely convert dates to ISO string
export function safeToISOString(date: string | Date | null | undefined): string {
  if (!date) return new Date().toISOString();
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return new Date().toISOString();
    return dateObj.toISOString();
  } catch (error) {
    console.warn('Date conversion error:', error);
    return new Date().toISOString();
  }
}
// Global Firebase types
declare global {
  namespace FirebaseFirestore {
    interface Timestamp {
      toDate(): Date;
    }
  }
}

export interface AdminUserData {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  createdAt: string | Date;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | null;
  joinDate?: string;
}

export interface AdminOrderData {
  id: string;
  userId: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
  status: "Pending" | "Processing" | "PodPacked" | "Dispatched" | "InTransit" | "Delivered" | "Cancelled";
  totalAmount: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  items?: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
      price: number;
    };
  }>;
}

export interface FirestoreOrder {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  items?: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
      price: number;
    };
  }>;
}

export interface FirestoreUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt: Date | string;
}

export interface FirestoreProduct {
  id: string;
  name: string;
  stock: number;
  price?: number;
}

export interface AdminDashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: AdminOrderData[];
  recentUsers: AdminUserData[];
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  averageOrderValue: number;
  topProducts: any[];
  lowStockProducts: number;
}

export type OrderStatus = "Pending" | "Processing" | "PodPacked" | "Dispatched" | "InTransit" | "Delivered" | "Cancelled";
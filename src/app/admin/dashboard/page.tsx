
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingBag, ListOrdered, PackageX, TrendingUp, Users, BarChart3, Loader2, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: any[];
  recentUsers: any[];
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  averageOrderValue: number;
  topProducts: any[];
  lowStockProducts: number;
  inventory: {
    lowStock: number;
    items: any[];
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any).role !== 'ADMIN') {
      redirect('/login');
    }
  }, [session, status]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
        
        if (result.success) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || 'Failed to load dashboard');
        }
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (session && (session.user as any).role === 'ADMIN') {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive">Failed to load dashboard data</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary">Admin Command Deck</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${dashboardData.averageOrderValue.toFixed(2)} per order
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Lifetime orders</p>
          </CardContent>
        </Card>
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered parents</p>
          </CardContent>
        </Card>
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow bg-destructive/10 border-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Stock Alerts</CardTitle>
            <PackageX className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{dashboardData.lowStockProducts} Products Low</div>
            <p className="text-xs text-destructive/80">Check inventory immediately</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary"/> Revenue Trends
            </CardTitle>
            <CardDescription>Monthly revenue performance (last 6 months).</CardDescription>
          </CardHeader>
          <CardContent className="h-72 bg-muted/30 rounded-md p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.monthlyRevenue} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1}}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `$${value.toFixed(2)}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }} dot={{r: 4, fill: 'hsl(var(--primary))'}} name="Revenue ($)" />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={2} activeDot={{ r: 6, fill: 'hsl(var(--accent))', stroke: 'hsl(var(--background))', strokeWidth: 2 }} dot={{r: 4, fill: 'hsl(var(--accent))'}} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary"/> Top Products
            </CardTitle>
            <CardDescription>Best performing products by quantity sold.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {dashboardData.topProducts.length > 0 ? dashboardData.topProducts.map((product, index) => (
                <li key={product.productId || index} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/20 transition-colors">
                  <span>{product.name}</span>
                  <span className="font-semibold text-primary">{product.totalSold} sold</span>
                </li>
              )) : (
                <li className="text-sm text-muted-foreground">No product data available</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
          <CardDescription>Current distribution of order statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(dashboardData.ordersByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="text-sm text-muted-foreground">{status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

       <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListOrdered className="mr-2 h-5 w-5 text-primary"/> Recent Orders
          </CardTitle>
           <CardDescription>Latest order activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentOrders.length > 0 ? dashboardData.recentOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="font-mono text-sm text-primary">#{order.id.slice(-8)}</span>
                <span className="text-sm">User: {order.userId.slice(-8)}</span>
                <span className="font-semibold text-sm">${order.totalAmount.toFixed(2)}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  order.status === 'Delivered' ? 'bg-green-500/20 text-green-700' :
                  order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700' :
                  order.status === 'Processing' ? 'bg-blue-500/20 text-blue-700' :
                  'bg-gray-500/20 text-gray-700'
                }`}>
                  {order.status}
                </span>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No recent orders</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {dashboardData.inventory.lowStock > 0 && (
        <Card className="shadow-card-glow border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <PackageX className="mr-2 h-5 w-5"/> Low Stock Alert
            </CardTitle>
            <CardDescription>Products that need immediate attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.inventory.items.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-center p-2 rounded bg-background">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-destructive font-bold">{item.stock} units left</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

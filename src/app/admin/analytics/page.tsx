'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart as LineChartIconLucide, Users, ShoppingBag, Lightbulb, DollarSign, Package } from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell,
  BarChart as ReBarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend 
} from 'recharts';
import { MarketingTools } from '@/components/admin/MarketingTools';
import { AdvancedAnalytics } from '@/components/admin/AdvancedAnalytics';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary">Advanced Analytics Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg. order: ${analyticsData.summary.averageOrderValue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.summary.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime orders</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.summary.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered parents</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.inventory.lowStock}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Section */}
      <AdvancedAnalytics data={analyticsData} isLoading={loading} error={error} />

      {/* Marketing Tools Section */}
      <div className="mt-8">
        <MarketingTools />
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary"/> Top Products</CardTitle>
            <CardDescription>Best-selling items this period.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {analyticsData.topProducts.map((product: any) => (
                <li key={product.name} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-md">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.orders} orders</p>
                  </div>
                  <span className="font-semibold text-primary">{product.quantity} units</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow bg-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent"/> AI Insights</CardTitle>
            <CardDescription>Data-driven recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.inventory.items.map((item: any) => (
              <div key={item.name} className="p-3 bg-background/50 rounded-md">
                <p className="font-medium text-primary">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Stock level: {item.stock} units
                  {item.stock <= 5 && " - Critical: Reorder immediately"}
                  {item.stock > 5 && item.stock <= 10 && " - Low: Consider reordering"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


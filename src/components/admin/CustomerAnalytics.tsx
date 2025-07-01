'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, Line } from 'react-chartjs-2';
import { Users, ShoppingBag, DollarSign, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

export function CustomerAnalytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const cacheKey = `customer-analytics-${timeRange}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          setAnalyticsData(JSON.parse(cached));
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `/api/analytics/customers?timeRange=${timeRange}`
        );
        if (!response.ok) throw new Error('Failed to fetch analytics');

        const data = await response.json();
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setAnalyticsData(data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load analytics'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.activeCustomers} active this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg.{' '}
              {analyticsData.averageOrderValue.toFixed(2)} per order
            </p>
          </CardContent>
        </Card>
        {/* Add more analytics cards */}
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Order Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="customers">Customer Growth</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Order Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chart implementation */}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Add more tabs content */}
      </Tabs>
    </div>
  );
}
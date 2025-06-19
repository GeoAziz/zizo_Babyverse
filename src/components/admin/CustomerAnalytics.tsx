'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ShoppingBag, Star, Users } from "lucide-react";

export function CustomerAnalytics() {
  // In a real app, these would come from an API
  const stats = {
    activeUsers: 1200,
    averageOrderValue: 125.50,
    customerLifetimeValue: 450.75,
    satisfactionRate: 4.8
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold">Customer Analytics</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Parents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>            <div className="text-2xl font-bold">KSH {(stats.averageOrderValue * 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSH {(stats.customerLifetimeValue * 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average per customer</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfactionRate}/5.0</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>
    </Card>
  );
}
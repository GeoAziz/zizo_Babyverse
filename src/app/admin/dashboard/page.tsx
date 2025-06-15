import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingBag, ListOrdered, PackageWarning, TrendingUp, Users, BarChart3 } from "lucide-react";

export default function AdminDashboardPage() {
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
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,200</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow bg-destructive/10 border-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Stock Alerts</CardTitle>
            <PackageWarning className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">5 Products Low</div>
            <p className="text-xs text-destructive/80">Check inventory immediately</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/> Sales Graph (Cosmic Orbit Style)</CardTitle>
            <CardDescription>Monthly sales performance.</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Sales chart placeholder</p>
            {/* Placeholder for a chart component, e.g., <SalesChart /> */}
          </CardContent>
        </Card>
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/> Hot Products This Week</CardTitle>
            <CardDescription>Top performing products.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {['Cosmic Comfort Diapers', 'Galaxy Glow Pacifier', 'Astro Organic Food'].map(product => (
                <li key={product} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/20 transition-colors">
                  <span>{product}</span>
                  <span className="font-semibold text-primary">+150 sales</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

       <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center"><ListOrdered className="mr-2 h-5 w-5 text-primary"/> Live Orders Feed</CardTitle>
           <CardDescription>Real-time order updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'ORD789', customer: 'L. Skywalker', total: '$75.50', status: 'Processing' },
              { id: 'ORD790', customer: 'H. Solo', total: '$120.00', status: 'Packed' },
              { id: 'ORD791', customer: 'C. Bacca', total: '$49.99', status: 'Shipped' },
            ].map(order => (
              <div key={order.id} className="flex flex-wrap justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="font-mono text-sm text-primary">{order.id}</span>
                <span className="text-sm">{order.customer}</span>
                <span className="font-semibold text-sm">{order.total}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-700' : order.status === 'Packed' ? 'bg-blue-500/20 text-blue-700' : 'bg-green-500/20 text-green-700'}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

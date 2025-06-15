'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart, PieChartIcon, Users, ShoppingBag, AlertTriangle, Lightbulb } from "lucide-react";
// Placeholder for actual chart component (e.g., from recharts or shadcn/ui charts)
// import { Bar, BarChart as ReBarChart, Line, LineChart as ReLineChart, Pie, PieChart as RePieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// const mockChartData = [
//   { name: 'Jan', sales: 4000, users: 2400 },
//   { name: 'Feb', sales: 3000, users: 1398 },
//   { name: 'Mar', sales: 2000, users: 9800 },
//   { name: 'Apr', sales: 2780, users: 3908 },
//   { name: 'May', sales: 1890, users: 4800 },
//   { name: 'Jun', sales: 2390, users: 3800 },
// ];
// const mockPieData = [
//   { name: '0-6 Months', value: 400 },
//   { name: '6-12 Months', value: 300 },
//   { name: '1-2 Years', value: 300 },
//   { name: '2+ Years', value: 200 },
// ];


export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary">Customer & Sales Analytics</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/> Top Age Groups</CardTitle>
            <CardDescription>Distribution of orders by baby age group.</CardDescription>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Age group pie chart placeholder</p>
            {/* <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={mockPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--primary))" label />
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer> */}
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart className="mr-2 h-5 w-5 text-primary"/> Top Regions</CardTitle>
            <CardDescription>Sales distribution by geographical region.</CardDescription>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Regional sales bar chart placeholder</p>
            {/* <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={mockChartData.slice(0,3).map(d => ({name: d.name, regions: d.sales/2}))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="regions" fill="hsl(var(--accent))" />
              </ReBarChart>
            </ResponsiveContainer> */}
          </CardContent>
        </Card>
        
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><LineChart className="mr-2 h-5 w-5 text-primary"/> Repeat Customers Rate</CardTitle>
            <CardDescription>Percentage of customers making repeat purchases over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center bg-muted/30 rounded-md">
             <p className="text-muted-foreground">Repeat customer line chart placeholder</p>
            {/* <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={mockChartData.map(d => ({name: d.name, repeatRate: d.users/100}))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="repeatRate" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
              </ReLineChart>
            </ResponsiveContainer> */}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary"/> Bundle Popularity</CardTitle>
          <CardDescription>Analysis of which product bundles are most popular.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {['Organic Starter Pack', 'Sleepy Time Bundle', 'Play & Learn Kit'].map(bundle => (
              <li key={bundle} className="flex justify-between items-center text-sm p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <span>{bundle}</span>
                <span className="font-semibold text-accent">75 orders this month</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow bg-accent/10 border-accent">
        <CardHeader>
          <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent"/> AI Suggestions</CardTitle>
          <CardDescription>Insights from Zizi to improve stock or run promotions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-md bg-background/50">
            <h4 className="font-semibold text-primary">Stock Recommendation:</h4>
            <p className="text-sm text-muted-foreground">Increase stock of 'Galaxy Glow Pacifier Set' by 20% due to rising demand in the '0-6 Months' age group.</p>
          </div>
          <div className="p-3 rounded-md bg-background/50">
            <h4 className="font-semibold text-primary">Promotion Idea:</h4>
            <p className="text-sm text-muted-foreground">Consider a "Welcome Baby" bundle targeting new parents in the 'Planet Zen' region, combining diapers, wipes, and a swaddle.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}


'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart as LineChartIconLucide, PieChartIcon as PieChartIconLucide, Users, ShoppingBag, Lightbulb } from "lucide-react"; // Renamed LineChart and PieChartIcon to avoid conflict
import { Bar, BarChart as ReBarChart, Line, LineChart as ReLineChart, Pie, PieChart as RePieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

const mockChartData = [
  { name: 'Jan', sales: 4000, users: 2400, repeatRate: 20 },
  { name: 'Feb', sales: 3000, users: 1398, repeatRate: 22 },
  { name: 'Mar', sales: 2000, users: 9800, repeatRate: 30 },
  { name: 'Apr', sales: 2780, users: 3908, repeatRate: 28 },
  { name: 'May', sales: 1890, users: 4800, repeatRate: 35 },
  { name: 'Jun', sales: 2390, users: 3800, repeatRate: 32 },
];
const mockPieData = [
  { name: '0-6 Months', value: 400 },
  { name: '6-12 Months', value: 300 },
  { name: '1-2 Years', value: 300 },
  { name: '2+ Years', value: 200 },
];
const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const mockRegionData = [
  { name: 'Galaxy North', sales: 2200 },
  { name: 'Planet Central', sales: 1800 },
  { name: 'Star Cluster West', sales: 1500 },
  { name: 'Nebula South', sales: 1200 },
];


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
          <CardContent className="h-60 bg-muted/30 rounded-md p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={mockPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label>
                   {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart className="mr-2 h-5 w-5 text-primary"/> Top Regions</CardTitle>
            <CardDescription>Sales distribution by geographical region.</CardDescription>
          </CardHeader>
          <CardContent className="h-60 bg-muted/30 rounded-md p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={mockRegionData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="name" fontSize={10} interval={0} />
                <YAxis fontSize={12}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{fill: 'hsl(var(--muted))'}}
                />
                <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-card-glow hover:shadow-glow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><LineChartIconLucide className="mr-2 h-5 w-5 text-primary"/> Repeat Customers Rate</CardTitle>
            <CardDescription>Percentage of customers making repeat purchases.</CardDescription>
          </CardHeader>
          <CardContent className="h-60 bg-muted/30 rounded-md p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={mockChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} unit="%"/>
                <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1}}
                />
                <Legend />
                <Line type="monotone" dataKey="repeatRate" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }} dot={{r: 4, fill: 'hsl(var(--primary))'}} />
              </ReLineChart>
            </ResponsiveContainer>
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


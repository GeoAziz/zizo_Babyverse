
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, ArrowLeft, PackageOpen, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { Order as PrismaOrder } from '@prisma/client'; // Use Prisma types
import { format } from 'date-fns';


export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<PrismaOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent('/profile/orders')}`);
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
      const data: PrismaOrder[] = await response.json();
      setOrders(data);
    } catch (e: any) {
      console.error("Error fetching orders:", e);
      setError(e.message || 'Could not load your order history.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => { // Prisma Order status is string
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100/70';
      case 'Processing': return 'text-blue-600 bg-blue-100/70';
      case 'Pod Packed': return 'text-indigo-600 bg-indigo-100/70';
      case 'Dispatched': return 'text-purple-600 bg-purple-100/70';
      case 'In Transit': return 'text-cyan-600 bg-cyan-100/70';
      case 'Delivered': return 'text-green-600 bg-green-100/70';
      case 'Cancelled': return 'text-red-600 bg-red-100/70';
      default: return 'text-gray-600 bg-gray-100/70';
    }
  };

  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your cosmic mission log...</p>
      </div>
    );
  }
  
   if (status === 'unauthenticated') {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Button variant="outline" asChild className="mb-8">
        <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile</Link>
      </Button>

      <Card className="shadow-glow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <ShoppingBag className="mr-3 h-8 w-8 text-accent" /> My Order History
          </CardTitle>
          <CardDescription>Review your past voyages and acquisitions from BabyVerse.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
             <div className="my-4 p-4 bg-destructive/10 text-destructive text-sm rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2"/> {error}
            </div>
          )}
          {!error && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-primary hover:underline">
                        <Link href={`/profile/orders/${order.id}`}>{order.id.substring(0,12)}...</Link>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'PP')}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/profile/orders/${order.id}`}>
                          <Eye className="mr-1 h-4 w-4" /> View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && !error && (
                <div className="text-center py-12">
                <PackageOpen size={64} className="text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-primary mb-2">No Orders Yet</h2>
                <p className="text-muted-foreground">Looks like your cosmic shopping cart is still waiting for its first mission!</p>
                <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/products">Start Shopping</Link>
                </Button>
                </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

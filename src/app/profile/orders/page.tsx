
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, ArrowLeft, PackageOpen, Eye, Loader2 } from 'lucide-react';
import type { Order } from '@/lib/types';
import { mockOrders } from '@/lib/mockData'; 
import { format } from 'date-fns';

const MOCK_AUTH_KEY = 'isBabyVerseMockLoggedIn';
const userSpecificOrders = mockOrders.filter(order => order.userId === 'user_1');

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem(MOCK_AUTH_KEY) === 'true') {
      setIsAuthorized(true);
      setOrders(userSpecificOrders);
    } else {
      router.push('/login');
    }
  }, [router]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Processing': return 'text-blue-600 bg-blue-100';
      case 'Pod Packed': return 'text-indigo-600 bg-indigo-100';
      case 'Dispatched': return 'text-purple-600 bg-purple-100';
      case 'In Transit': return 'text-cyan-600 bg-cyan-100';
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isClient || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying your cosmic credentials...</p>
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
          {orders.length > 0 ? (
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
                    <TableCell className="font-mono text-primary">{order.id}</TableCell>
                    <TableCell>{format(new Date(order.orderDate), 'PP')}</TableCell>
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
            <div className="text-center py-12">
              <PackageOpen size={64} className="text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-primary mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground">Looks like your cosmic shopping cart is still waiting for its first mission!</p>
              <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, CalendarDays, MapPin, CreditCardIcon, Truck, HelpCircle, ShoppingBag, Loader2 } from 'lucide-react';
import type { Order, OrderItem } from '@/lib/types';
import { mockOrders } from '@/lib/mockData'; 
import { format } from 'date-fns';

const MOCK_AUTH_KEY = 'isBabyVerseMockLoggedIn';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem(MOCK_AUTH_KEY) === 'true') {
      setIsAuthorized(true);
      const foundOrder = mockOrders.find(o => o.id === params.id);
      setOrder(foundOrder || null);
    } else {
      router.push('/login');
    }
  }, [params.id, router]);

  if (!isClient || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying your cosmic credentials...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
         <Button variant="outline" asChild className="mb-8 float-left">
            <Link href="/profile/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Order History</Link>
        </Button>
        <div className="clear-both pt-10">
            <Package className="mx-auto h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl font-headline font-bold text-primary mb-2">Order Not Found</h1>
            <p className="text-muted-foreground">We couldn't locate this order in our cosmic records.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600';
      case 'Processing': return 'text-blue-600';
      case 'Pod Packed': return 'text-indigo-600';
      case 'Dispatched': return 'text-purple-600';
      case 'In Transit': return 'text-cyan-600';
      case 'Delivered': return 'text-green-600';
      case 'Cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Button variant="outline" asChild className="mb-8">
        <Link href="/profile/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Order History</Link>
      </Button>

      <Card className="shadow-glow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <CardTitle className="text-3xl font-headline text-primary flex items-center">
                    <ShoppingBag className="mr-3 h-8 w-8 text-accent" /> Order Details
                </CardTitle>
                <CardDescription className="font-mono text-sm">ID: {order.id}</CardDescription>
            </div>
            <div className={`mt-2 sm:mt-0 text-lg font-semibold px-3 py-1 rounded-md ${getStatusColor(order.status).replace('text-', 'bg-').replace('-600', '-100')} ${getStatusColor(order.status)}`}>
              Status: {order.status}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold text-primary mb-3">Items in Your Order:</h3>
            {order.items.map((item: OrderItem, index: number) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Image 
                  src={`https://placehold.co/80x80.png`} 
                  alt={item.name} 
                  width={70} 
                  height={70} 
                  className="rounded-md border object-cover"
                  data-ai-hint="baby product"
                />
                <div className="flex-grow">
                  <p className="font-medium text-primary">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  <p className="text-sm text-muted-foreground">Price: ${item.price.toFixed(2)} each</p>
                </div>
                <p className="text-md font-semibold text-primary">${(item.quantity * item.price).toFixed(2)}</p>
              </div>
            ))}
             <Separator className="my-6" />
            <div className="text-right space-y-1">
                <p className="text-muted-foreground">Subtotal: <span className="font-medium text-primary">${(order.totalAmount - (order.trackingNumber ? 5.99 : 0)).toFixed(2)}</span></p> 
                <p className="text-muted-foreground">Shipping: <span className="font-medium text-primary">${order.trackingNumber ? '5.99' : '0.00'}</span></p>
                <p className="text-xl font-bold text-primary">Total: ${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-6 md:border-l md:pl-6">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-primary flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-accent"/> Dates</h4>
              <p className="text-sm text-muted-foreground"><strong>Ordered:</strong> {format(new Date(order.orderDate), 'PPP p')}</p>
              {order.estimatedDelivery && (
                <p className="text-sm text-muted-foreground"><strong>Estimated Delivery:</strong> {format(new Date(order.estimatedDelivery), 'PPP')}</p>
              )}
            </div>
             <Separator />
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-primary flex items-center"><MapPin className="mr-2 h-5 w-5 text-accent"/> Shipping Address</h4>
              <address className="text-sm text-muted-foreground not-italic">
                {order.shippingAddress.street},<br />
                {order.shippingAddress.city}, {order.shippingAddress.zip},<br />
                {order.shippingAddress.country}
              </address>
            </div>
             <Separator />
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-primary flex items-center"><CreditCardIcon className="mr-2 h-5 w-5 text-accent"/> Payment Method</h4>
              <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
            </div>
            {order.trackingNumber && (
               <>
                <Separator />
                <div className="space-y-3">
                <h4 className="text-lg font-semibold text-primary flex items-center"><Truck className="mr-2 h-5 w-5 text-accent"/> Tracking</h4>
                <p className="text-sm text-muted-foreground">Number: <span className="font-mono text-primary">{order.trackingNumber}</span></p>
                <Button variant="outline" size="sm" className="w-full">Track Package (Conceptual)</Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t p-6">
            <Button variant="ghost" asChild className="text-accent hover:text-accent/80">
                <Link href="/contact">
                    <HelpCircle className="mr-2 h-4 w-4"/> Need help with this order?
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, ArrowRight, Loader2, Package, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Order as PrismaOrder, OrderItem as PrismaOrderItem, Product } from '@prisma/client'; // Prisma types
import { format } from 'date-fns';


interface ConfirmedOrderItem extends PrismaOrderItem {
  // Product details are directly on OrderItem from API (name, price)
  // If we needed full product object: product?: Product; 
  // For now, name and price on OrderItem are sufficient as per schema.
  // If imageUrl is needed, it would have to be added to OrderItem or fetched separately.
}

interface ConfirmedOrder extends PrismaOrder {
  items: ConfirmedOrderItem[];
}


export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/checkout/confirmation/${orderId}`);
    } else if (status === 'authenticated' && orderId) {
      fetchOrderDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, orderId, router]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch order details');
      }
      const data: ConfirmedOrder = await response.json();
      setOrder(data);
    } catch (e: any) {
      console.error('Error fetching order:', e);
      setError(e.message || 'Could not load your order confirmation.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Finalizing your cosmic order details...</p>
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

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <AlertTriangle size={64} className="text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-headline font-bold text-primary mb-2">Error Loading Confirmation</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild>
          <Link href="/profile/orders">Go to My Orders</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
     return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Package size={64} className="text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-headline font-bold text-primary mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-4">We couldn't find the details for this order.</p>
         <Button asChild>
          <Link href="/profile/orders">Go to My Orders</Link>
        </Button>
      </div>
    );
  }
  
  const shippingAddress = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress as any;


  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto shadow-glow-lg text-center border-green-500/50">
        <CardHeader className="bg-green-500/10 p-8">
          <CheckCircle className="mx-auto h-20 w-20 text-green-600 mb-4 animate-pulse" />
          <CardTitle className="text-3xl font-headline text-primary">Order Confirmed!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your BabyVerse package is now preparing for its cosmic journey to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6 text-left">
          <div>
            <h3 className="font-semibold text-primary mb-1">Order ID:</h3>
            <p className="text-muted-foreground font-mono">{order.id}</p>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-1">Order Date:</h3>
            <p className="text-muted-foreground">{format(new Date(order.createdAt), 'PPP p')}</p>
          </div>
           {order.estimatedDelivery && (
            <div>
                <h3 className="font-semibold text-primary mb-1">Estimated Delivery:</h3>
                <p className="text-muted-foreground">{format(new Date(order.estimatedDelivery), 'PPP')}</p>
            </div>
           )}
          <div>
            <h3 className="font-semibold text-primary mb-1">Shipping To:</h3>
            <p className="text-muted-foreground">
              {shippingAddress.fullName}<br />
              {shippingAddress.address}<br />
              {shippingAddress.city}, {shippingAddress.postalCode}<br />
              {shippingAddress.country}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-primary mb-2">Items in this Shipment:</h3>
            <ul className="space-y-3">
              {order.items.map(item => (
                <li key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-md">
                  <Image 
                    src={'https://placehold.co/80x80.png'} // Placeholder, as imageUrl is not on OrderItem
                    alt={item.name} 
                    width={60} 
                    height={60} 
                    className="rounded border" 
                    data-ai-hint="baby product" // Generic hint
                  />
                  <div>
                    <p className="font-medium text-primary">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="ml-auto font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-right border-t pt-4">
            <p className="text-lg font-bold text-primary">Total: ${order.totalAmount.toFixed(2)}</p>
          </div>

          <div className="text-center space-y-3 mt-8">
             <p className="text-sm text-muted-foreground">
              You'll receive an email confirmation shortly to {shippingAddress.email} with your order details and tracking information (once available).
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="w-full sm:w-auto ml-0 sm:ml-2 mt-2 sm:mt-0">
              <Link href="/profile/orders">
                View Order History <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  createdAt: any;
  updatedAt?: any;
  trackingNumber?: string;
  paymentMethod?: string;
  shippedAt?: any;
  deliveredAt?: any;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderId = params.id as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchOrder();
    }
  }, [status, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Could not load order details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#23234b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#23234b] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground text-center mb-4">
              {error || "We couldn't find the order you're looking for."}
            </p>
            <Button asChild>
              <Link href="/profile?tab=orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#23234b] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-accent">Order #{order.id}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Order Status */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.trackingNumber && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tracking:</span>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {order.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>
                
                {order.status.toLowerCase() === 'shipped' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Package is on the way!</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Your order has been shipped and is currently in transit.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.product.category}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">Quantity: {item.quantity}</span>
                          <span className="font-medium">
                            KSH {(item.product.price * item.quantity * 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">KSH {(order.totalAmount * 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span>{order.paymentMethod === 'paypal' ? 'PayPal' : 'Credit Card'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">KSH {(order.totalAmount * 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-sm text-muted-foreground">📞 {order.shippingAddress.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Order placed</span>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {order.status !== 'Pending' && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Payment confirmed</span>
                    </div>
                  )}
                  
                  {order.shippedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-purple-500" />
                      <span>Shipped</span>
                      <span className="text-muted-foreground ml-auto">
                        {new Date(order.shippedAt?.seconds * 1000 || order.shippedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {order.deliveredAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Delivered</span>
                      <span className="text-muted-foreground ml-auto">
                        {new Date(order.deliveredAt?.seconds * 1000 || order.deliveredAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button asChild variant="outline">
            <Link href="/profile?tab=orders">Back to Orders</Link>
          </Button>
          
          {order.status.toLowerCase() === 'delivered' && (
            <Button asChild>
              <Link href="/products">Shop Again</Link>
            </Button>
          )}
          
          <Button variant="ghost" asChild>
            <Link href="/contact">Need Help?</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

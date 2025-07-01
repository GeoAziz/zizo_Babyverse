
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';

// Mock order details for confirmation page
const mockConfirmedOrder = {
  id: `ORDER-${Date.now().toString().slice(-6)}`,
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  total: 78.47, // Example total
  estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), // 5 days from now
  items: [
    { name: 'Cosmic Comfort Diapers', quantity: 2, price: 29.99, imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'diapers' },
    { name: 'Galaxy Glow Pacifier Set', quantity: 1, price: 12.50, imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'pacifier' },
  ],
  shippingAddress: {
    fullName: 'Lana Astranova',
    address: '123 Comet Trail',
    city: 'Star City',
    postalCode: '90210',
    country: 'Galaxy Prime',
  }
};

export default function OrderConfirmationPage() {
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
            <p className="text-muted-foreground font-mono">{mockConfirmedOrder.id}</p>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-1">Order Date:</h3>
            <p className="text-muted-foreground">{mockConfirmedOrder.date}</p>
          </div>
           <div>
            <h3 className="font-semibold text-primary mb-1">Estimated Delivery:</h3>
            <p className="text-muted-foreground">{mockConfirmedOrder.estimatedDelivery}</p>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-1">Shipping To:</h3>
            <p className="text-muted-foreground">
              {mockConfirmedOrder.shippingAddress.fullName}<br />
              {mockConfirmedOrder.shippingAddress.address}<br />
              {mockConfirmedOrder.shippingAddress.city}, {mockConfirmedOrder.shippingAddress.postalCode}<br />
              {mockConfirmedOrder.shippingAddress.country}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-primary mb-2">Items in this Shipment:</h3>
            <ul className="space-y-3">
              {mockConfirmedOrder.items.map(item => (
                <li key={item.name} className="flex items-center gap-4 p-3 bg-muted/30 rounded-md">
                  <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded border" data-ai-hint={item.dataAiHint} />
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
            <p className="text-lg font-bold text-primary">Total: ${mockConfirmedOrder.total.toFixed(2)}</p>
          </div>

          <div className="text-center space-y-3 mt-8">
             <p className="text-sm text-muted-foreground">
              You'll receive an email confirmation shortly with your order details and tracking information (once available).
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


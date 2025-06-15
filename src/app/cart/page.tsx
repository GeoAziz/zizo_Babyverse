
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Trash2, ArrowRight, PackagePlus, CreditCard, Minus, Plus, Loader2 } from 'lucide-react';
import { mockProducts } from '@/lib/mockData'; // Keep for mock cart items if needed temporarily
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

interface CartItem extends Product {
  quantity: number;
}

// Example: In a real app, cart might be fetched from backend or persisted in localStorage linked to user
const initialCartItems: CartItem[] = mockProducts.slice(0, 2).map((product, index) => ({
  ...product,
  quantity: index + 1,
}));


export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems); // Keep mock items for now
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();


  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/cart';
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    // If status is 'authenticated', cart can be loaded/managed
    // For now, we continue with mock cart items
  }, [status, router, searchParams]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    if (itemToRemove) {
       toast({ title: `${itemToRemove.name} removed from cart`, variant: 'destructive' });
    }
  };

  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = cartSubtotal > 0 ? 5.99 : 0; // Mock shipping
  const cartTotal = cartSubtotal + shippingCost;

  const handleCheckout = () => {
    // In a real app, this would likely save the cart to backend before redirecting
    toast({ title: "Proceeding to Checkout!", description: "Teleporting you to the payment dimension..." });
    router.push('/checkout');
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Preparing your cart for hyperjump...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-glow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <ShoppingCart className="mr-3 h-8 w-8 text-accent" /> Your Cosmic Cart
          </CardTitle>
          <CardDescription>Review your items before launching your order.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {cartItems.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-0">
              <div className="md:col-span-2 p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Remove</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={60}
                            height={60}
                            className="rounded-md object-cover border"
                            data-ai-hint={item.dataAiHint || item.category.toLowerCase()}
                          />
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${item.id}`} className="font-medium hover:text-accent transition-colors">
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center border border-input rounded-md w-28 mx-auto">
                            <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="h-8 w-8 rounded-r-none border-r border-input">
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="h-8 w-8 rounded-l-none border-l border-input">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:col-span-1 bg-muted/30 p-6 border-l">
                <h3 className="text-xl font-semibold mb-4 text-primary">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Label htmlFor="promoCode" className="text-sm font-medium">Promo Code (Optional)</Label>
                  <div className="flex mt-1">
                    <Input id="promoCode" placeholder="Enter code" className="rounded-r-none focus:border-accent focus:ring-accent" />
                    <Button variant="outline" className="rounded-l-none border-l-0 border-primary text-primary hover:bg-primary/10">Apply</Button>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  <CreditCard className="mr-2 h-5 w-5" /> Proceed to Checkout
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <PackagePlus size={72} className="text-muted-foreground mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-headline font-semibold text-primary mb-3">Your Cart is Empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any cosmic goodies yet. Explore our universe of products!
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/products">
                  <ArrowRight className="mr-2 h-5 w-5" /> Start Shopping
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

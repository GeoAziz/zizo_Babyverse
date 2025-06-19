'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Trash2, ArrowRight, PackagePlus, CreditCard, Minus, Plus, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import type { CartItemWithProduct } from '@/app/api/cart/route';

function CartPageContent() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();


  const fetchCartItems = async () => {
    if (status !== 'authenticated') return;
    setIsLoadingCart(true);
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      const data: CartItemWithProduct[] = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({ title: "Error", description: "Could not load your cart.", variant: "destructive" });
    } finally {
      setIsLoadingCart(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/cart';
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if (status === 'authenticated') {
      fetchCartItems();
      
      // Add cart update listener
      const handleCartUpdate = () => {
        fetchCartItems();
      };
      window.addEventListener('cartUpdate', handleCartUpdate);
      return () => {
        window.removeEventListener('cartUpdate', handleCartUpdate);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, searchParams]);

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const originalItems = [...cartItems];
    const itemToUpdate = cartItems.find(item => item.id === cartItemId);
    if (!itemToUpdate) return;

    // Optimistic update
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!response.ok) {
        setCartItems(originalItems); // Revert optimistic update
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity');
      }
      const updatedItem = await response.json();
      // Update with server response to ensure consistency (e.g. if server clamps quantity due to stock)
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      toast({ title: "Quantity Updated", description: `${itemToUpdate.product.name} quantity set to ${newQuantity}.` });
    } catch (error: any) {
      setCartItems(originalItems); // Revert optimistic update on error
      toast({ title: "Error", description: error.message || "Could not update quantity.", variant: "destructive" });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === cartItemId);
    if (!itemToRemove) return;

    const originalItems = [...cartItems];
    // Optimistic update
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));

    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        setCartItems(originalItems); // Revert
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item');
      }
      toast({ title: `${itemToRemove.product.name} removed from cart`, variant: 'destructive' });
    } catch (error: any) {
      setCartItems(originalItems); // Revert
      toast({ title: "Error", description: error.message || "Could not remove item.", variant: "destructive" });
    }
  };

  const cartSubtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const shippingCost = cartSubtotal > 0 ? 5.99 : 0; // Mock shipping
  const cartTotal = cartSubtotal + shippingCost;

  const handleCheckout = () => {
    toast({ title: "Proceeding to Checkout!", description: "Teleporting you to the payment dimension..." });
    router.push('/checkout');
  }

  if (status === 'loading' || (status === 'authenticated' && isLoadingCart)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Summoning your cosmic cart...</p>
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
                            src={item.product.imageUrl || 'https://placehold.co/80x80.png'}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="rounded-md object-cover border"
                            data-ai-hint={item.product.dataAiHint || item.product.category?.toLowerCase()}
                          />
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${item.productId}`} className="font-medium hover:text-accent transition-colors">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{item.product.category}</p>
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
                        </TableCell>                        <TableCell className="text-right">KSH {(item.product.price * 100).toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">KSH {(item.product.price * item.quantity * 100).toFixed(2)}</TableCell>
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
                    <span>Subtotal</span>                    <span>KSH {(cartSubtotal * 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>KSH {(shippingCost * 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
                    <span>Total</span>
                    <span>KSH {(cartTotal * 100).toFixed(2)}</span>
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

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading cart contents...</p>
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}

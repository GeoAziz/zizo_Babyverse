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
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart.js';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.js';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right.js';
import PackagePlus from 'lucide-react/dist/esm/icons/package-plus.js';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card.js';
import Minus from 'lucide-react/dist/esm/icons/minus.js';
import Plus from 'lucide-react/dist/esm/icons/plus.js';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2.js';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.js';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
// Define CartItemWithProduct type locally (adjust fields as needed)
type CartItemWithProduct = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
};

function CartPageContent() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{promo?: any, discount: number, error?: string} | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [actionLoading, setActionLoading] = useState<{[id:string]: boolean}>({}); // For per-item loading
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
      let data = await response.json();
      // Always use data.items (API returns { items: [...] })
      // Patch: add id and productId if missing (best practice for frontend resilience)
      const items = Array.isArray(data?.items)
        ? data.items.map((item: any) => ({
            ...item,
            id: item.id || item.product?.id || '',
            productId: item.product?.id || '',
          }))
        : [];
      setCartItems(items);
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
    setActionLoading(prev => ({ ...prev, [cartItemId]: true }));
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
    } finally {
      setActionLoading(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Remove item: only update UI after backend confirms removal
  // Remove item: optimistically update UI, then confirm with backend
  const handleRemoveItem = async (cartItemId: string) => {
    // Debug: log the cartItemId
    console.log('handleRemoveItem called with cartItemId:', cartItemId);
    if (!cartItemId) {
      toast({ title: 'Error', description: 'Invalid cart item ID.', variant: 'destructive' });
      return;
    }
    const originalItems = [...cartItems];
    const itemToRemove = cartItems.find(item => item.id === cartItemId);
    if (!itemToRemove) {
      setActionLoading(prev => ({ ...prev, [cartItemId]: false }));
      toast({ title: 'Error', description: 'Item not found in cart.', variant: 'destructive' });
      return;
    }
    // Optimistically remove from UI
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    setActionLoading(prev => ({ ...prev, [cartItemId]: true }));
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, { method: 'DELETE' });
      if (!response.ok) {
        // Revert optimistic update
        setCartItems(originalItems);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove item from cart.');
      }
      toast({ title: `${itemToRemove.product.name} removed from cart`, variant: 'destructive' });
      // Optionally, refetch cart to ensure sync (debounced to avoid flicker)
      setTimeout(() => {
        fetchCartItems();
      }, 200);
    } catch (error: any) {
      setCartItems(originalItems);
      toast({ title: 'Error', description: error.message || 'Could not remove item from cart.', variant: 'destructive' });
    } finally {
      setActionLoading(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleApplyPromo = async () => {
    setPromoResult(null);
    setIsApplyingPromo(true);
    if (!promoCode) { setIsApplyingPromo(false); return; }
    try {
      const response = await fetch('/api/cart/apply-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPromoResult({ promo: undefined, discount: 0, error: data.message || 'Invalid promo code.' });
        toast({ title: 'Promo Error', description: data.message || 'Invalid promo code.', variant: 'destructive' });
        setIsApplyingPromo(false);
        return;
      }
      setPromoResult({ promo: data.promo, discount: data.discount });
      toast({ title: 'Promo Applied', description: `Promo code ${data.promo.code} applied!` });
    } catch (error: any) {
      setPromoResult({ promo: undefined, discount: 0, error: error.message || 'Failed to apply promo.' });
      toast({ title: 'Promo Error', description: error.message || 'Failed to apply promo.', variant: 'destructive' });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Defensive: ensure cartItems is always an array for reduce
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartSubtotal = safeCartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const shippingCost = cartSubtotal > 0 ? 5.99 : 0; // Mock shipping
  const discount = promoResult?.discount || 0;
  const cartTotal = cartSubtotal + shippingCost - discount;

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
                    {cartItems && Array.isArray(cartItems) && cartItems.length > 0 ? (
                      cartItems.filter(item => !!item && !!item.id && item.product && item.product.name).map((item) => (
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
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Decrease quantity for ${item.product.name}`}
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={actionLoading[item.id] || item.quantity <= 1}
                                tabIndex={0}
                              >
                                {actionLoading[item.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
                              </Button>
                              <Input
                                type="number"
                                aria-label={`Quantity for ${item.product.name}`}
                                value={item.quantity}
                                min={1}
                                max={item.product.stock}
                                onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                                disabled={actionLoading[item.id]}
                                tabIndex={0}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Increase quantity for ${item.product.name}`}
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={actionLoading[item.id] || item.quantity >= item.product.stock}
                                tabIndex={0}
                              >
                                {actionLoading[item.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                              </Button>
                            </div>
                            {typeof item.product.stock === 'number' && item.quantity >= item.product.stock && (
                              <div className="text-xs text-destructive mt-1 text-center">Max stock reached</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">KSH {(item.product.price * 100).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold">KSH {(item.product.price * item.quantity * 100).toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            {item.id ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Remove ${item.product.name} from cart`}
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={actionLoading[item.id]}
                                tabIndex={0}
                              >
                                {actionLoading[item.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : null}
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
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Promo Discount</span>
                      <span>-KSH {(discount * 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
                    <span>Total</span>
                    <span>KSH {(cartTotal * 100).toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Label htmlFor="promoCode" className="text-sm font-medium">Promo Code (Optional)</Label>
                  <div className="flex mt-1">
                    <Input
                      aria-label="Promo code"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      disabled={isApplyingPromo}
                      tabIndex={0}
                    />
                    <Button
                      onClick={handleApplyPromo}
                      aria-label="Apply promo code"
                      disabled={isApplyingPromo}
                      tabIndex={0}
                    >
                      {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      <span className="sr-only">Apply promo code</span>
                    </Button>
                  </div>
                  {promoResult?.promo && !promoResult?.error && (
                    <div aria-live="polite" role="status" className="mt-2 text-green-700 text-sm flex items-center gap-2">
                      <span>Promo "{promoResult.promo.code}" applied: -KSH {(promoResult.discount * 100).toFixed(2)}</span>
                    </div>
                  )}
                  {promoResult?.error && (
                    <div aria-live="polite" role="status" className="mt-2 text-destructive text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{promoResult.error}</span>
                    </div>
                  )}
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

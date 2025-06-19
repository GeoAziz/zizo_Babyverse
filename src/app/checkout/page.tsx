'use client';

import { useState, type FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, CreditCard, Rocket, ShoppingBag, User, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { CartItemWithProduct } from '@/app/api/cart/route';
import type { Order as PrismaOrder, OrderItem as PrismaOrderItem } from '@prisma/client';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import type { OnApproveData, OnApproveActions, CreateOrderData, CreateOrderActions } from '@paypal/paypal-js';

interface CheckoutOrder extends PrismaOrder {
  items: PrismaOrderItem[];
}

function CheckoutPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Galaxy Prime',
    email: '' 
  });
  const [paymentInfo, setPaymentInfo] = useState({ // All mock payment info
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [cartSummary, setCartSummary] = useState<{items: CartItemWithProduct[], subtotal: number, shipping: number, total: number} | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/checkout';
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if (status === 'authenticated') {
      if (session?.user) {
        setShippingInfo(prev => ({ 
          ...prev, 
          email: session.user?.email || '', 
          fullName: session.user?.name || ''
        }));
      }
      fetchCartSummary();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router, searchParams]);

  const fetchCartSummary = async () => {
    setIsLoadingCart(true);
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart summary');
      const items: CartItemWithProduct[] = await response.json();
      if (items.length === 0) {
        toast({ title: "Empty Cart", description: "Your cart is empty. Add some items before checkout.", variant: "destructive" });
        router.push('/cart');
        return;
      }
      const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const shipping = subtotal > 0 ? 5.99 : 0;
      setCartSummary({ items, subtotal, shipping, total: subtotal + shipping });
    } catch (error) {
      toast({ title: "Error", description: "Could not load cart summary.", variant: "destructive" });
      router.push('/cart');
    } finally {
      setIsLoadingCart(false);
    }
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNextStep = (e?: FormEvent) => {
    e?.preventDefault();
    if (currentStep === 1) { 
        if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.email) {
            toast({title: "Missing Shipping Info", description: "Please fill all shipping details, including email.", variant: "destructive"});
            return;
        }
    }
    if (currentStep === 2) { 
        if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
            toast({title: "Missing Payment Info", description: "Please fill all mock payment details.", variant: "destructive"});
            return;
        }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePlaceOrder = async (e: FormEvent | any) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (!cartSummary || cartSummary.items.length === 0) {
        toast({ title: "Empty Cart", description: "Cannot place an order with an empty cart.", variant: "destructive" });
        return;
    }
    setIsPlacingOrder(true);
    
    const orderPayload = e.shippingAddress ? e : {
      shippingAddress: shippingInfo,
      // paymentMethodId: "mock_payment_id" // For real payment
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }
      const createdOrder: CheckoutOrder = await response.json();
      toast({
        title: "Order Placed!",
        description: `Order ${createdOrder.id} successfully placed. Redirecting to confirmation...`,
      });
      router.push(`/checkout/confirmation/${createdOrder.id}`); 
    } catch (error: any) {
      toast({ title: "Order Error", description: error.message || "Could not place order.", variant: "destructive" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && isLoadingCart)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Preparing your cosmic launch sequence...</p>
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

  if (!cartSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-muted-foreground">Loading cart details...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto shadow-glow-lg">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <Rocket className="mr-3 h-8 w-8 text-accent" /> Secure Checkout
          </CardTitle>
          <CardDescription>Finalize your journey to parenthood excellence.</CardDescription>
        </CardHeader>
        
        <div className="grid md:grid-cols-3">
          <div className="md:col-span-2 p-6 space-y-8">
            <div className="flex justify-around mb-6">
              <div className={`text-center ${currentStep >= 1 ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>
                <MapPin className={`mx-auto mb-1 h-6 w-6 ${currentStep >=1 ? 'text-accent' : ''}`}/> Shipping
              </div>
              <div className={`text-center ${currentStep >= 2 ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>
                <CreditCard className={`mx-auto mb-1 h-6 w-6 ${currentStep >=2 ? 'text-accent' : ''}`}/> Payment
              </div>
              <div className={`text-center ${currentStep >= 3 ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>
                <ShoppingBag className={`mx-auto mb-1 h-6 w-6 ${currentStep >=3 ? 'text-accent' : ''}`}/> Review
              </div>
            </div>

            {currentStep === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <h2 className="text-xl font-semibold text-primary">Shipping Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={shippingInfo.fullName} onChange={handleShippingChange} required />
                  </div>
                   <div>
                    <Label htmlFor="email">Email (for updates)</Label>
                    <Input id="email" name="email" type="email" value={shippingInfo.email} onChange={handleShippingChange} placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" name="address" value={shippingInfo.address} onChange={handleShippingChange} required />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City/Star System</Label>
                    <Input id="city" name="city" value={shippingInfo.city} onChange={handleShippingChange} required />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal/Zip Code</Label>
                    <Input id="postalCode" name="postalCode" value={shippingInfo.postalCode} onChange={handleShippingChange} required />
                  </div>
                  <div>
                    <Label htmlFor="country">Country/Galaxy</Label>
                    <Input id="country" name="country" value={shippingInfo.country} onChange={handleShippingChange} required />
                  </div>
                </div>
                <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <h2 className="text-xl font-semibold text-primary">Payment Details</h2>
                <div className="space-y-4">                  {/* PayPal Button */}
                  <div className="p-4 border rounded-lg">
                    <PayPalButtons
                      forceReRender={[cartSummary.total]}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: {
                              currency_code: "USD",
                              value: cartSummary.total.toFixed(2),
                              breakdown: {
                                item_total: {
                                  currency_code: "USD",
                                  value: cartSummary.subtotal.toFixed(2)
                                },
                                shipping: {
                                  currency_code: "USD",
                                  value: cartSummary.shipping.toFixed(2)
                                }
                              }
                            },
                            items: cartSummary.items.map(item => ({
                              name: item.product.name,
                              unit_amount: {
                                currency_code: "USD",
                                value: item.product.price.toFixed(2)
                              },
                              quantity: item.quantity.toString()
                            }))
                          }]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        try {
                          const order = await actions.order?.capture();
                          if (order) {
                            const orderPayload = {
                              shippingAddress: shippingInfo,
                              paymentMethodId: "paypal",
                              paypalOrderId: data.orderID
                            };
                            await handlePlaceOrder(orderPayload);
                          }
                        } catch (error) {
                          toast({
                            title: "Payment Failed",
                            description: "There was an error processing your payment.",
                            variant: "destructive"
                          });
                        }
                      }}
                      style={{ layout: "vertical" }}
                    />
                  </div>
                  
                  {/* Disabled Card Payment Section */}
                  <div className="flex gap-4 p-4 border rounded-lg items-center opacity-50">
                    <input type="radio" name="paymentMethod" value="stripe" disabled />
                    <div>
                      <h3 className="font-medium">Card Payment (Coming Soon)</h3>
                      <p className="text-sm text-muted-foreground">Pay with credit/debit card</p>
                    </div>
                  </div>
                </div>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="w-full sm:w-auto">Back to Shipping</Button>
                    <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                    Review Order <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <h2 className="text-xl font-semibold text-primary">Review Your Cosmic Order</h2>
                <div>
                  <h3 className="font-medium text-muted-foreground mb-1">Shipping To:</h3>
                  <p>{shippingInfo.fullName} ({shippingInfo.email})</p>
                  <p>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}</p>
                </div>
                 <div>
                  <h3 className="font-medium text-muted-foreground mb-1">Payment Method:</h3>
                  <p>Card ending in •••• {paymentInfo.cardNumber.slice(-4)} (Mock)</p>
                </div>
                <p className="text-sm text-muted-foreground">By clicking "Place Order", you agree to our (conceptual) Terms of Service.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full sm:w-auto" disabled={isPlacingOrder}>Back to Payment</Button>
                    <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPlacingOrder}>
                      {isPlacingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                      {isPlacingOrder ? 'Launching Order...' : 'Place Order & Launch!'}
                    </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="md:col-span-1 bg-muted/30 p-6 border-t md:border-t-0 md:border-l">
            <h3 className="text-xl font-semibold mb-4 text-primary">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {cartSummary.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                  <span>{item.product.name} (x{item.quantity})</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${cartSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>${cartSummary.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t mt-2">
                <span>Total</span>
                <span>${cartSummary.total.toFixed(2)}</span>
              </div>
            </div>
             <p className="text-xs text-muted-foreground mt-4">Have a promo code? Apply it in your <Link href="/cart" className="text-accent hover:underline">cart</Link>.</p>
          </aside>
        </div>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "ARTOq_3ZQaLVQVlbjrD-_84O9eQYrsmwpL9Pjl1l2nCCJ1diAipfPFNbrbLO1BUG7oKB9G4swv86ZJEk",
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Preparing checkout...</p>
        </div>
      }>
        <CheckoutPageContent />
      </Suspense>
    </PayPalScriptProvider>
  );
}

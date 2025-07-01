"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, CreditCard, PackagePlus, Lock, Loader2, CheckCircle, ArrowRight, MapPin, Trash2, Minus, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useCart } from '@/context/cart-context';

const steps = [
  { label: "Cart Review", icon: <ShoppingCart className="h-5 w-5" /> },
  { label: "Shipping Info", icon: <MapPin className="h-5 w-5" /> },
  { label: "Payment & Confirm", icon: <CreditCard className="h-5 w-5" /> },
];

export default function CheckoutPage() {
  const { items, subtotal, total, removeItem, updateQuantity } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Calculate shipping and discount locally
  const shipping = subtotal > 0 ? 5.99 : 0;
  const discount = 0; // Implement promo logic if needed

  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '', city: '', zone: '', method: 'FAST', date: '' });
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Check for cancelled payment
  useEffect(() => {
    const cancelled = searchParams.get('cancelled');
    if (cancelled === '1') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive"
      });
      // Clear the URL parameter
      router.replace('/checkout', undefined);
    }
  }, [searchParams, toast, router]);

  // Auth-guard
  useEffect(() => {
    if (status === 'unauthenticated') router.push(`/login?callbackUrl=/checkout`);
  }, [status, router]);

  // Step 1: Cart Review
  const CartReview = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-background to-muted/40 border-0 shadow-glow-md backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <ShoppingCart className="h-7 w-7 text-accent" /> Cart Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <PackagePlus size={48} className="mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-lg text-muted-foreground">Your cart is empty.</p>
              <Button asChild className="mt-4 bg-accent text-white" aria-label="Return to shop">
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item: any) => (
                <li key={item.id || item.product.id} className="flex items-center gap-4 bg-white/5 rounded-lg p-3 animate-slide-in">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 rounded-md object-cover border border-accent/30" />
                  <div className="flex-1">
                    <div className="font-semibold text-primary">{item.product.name}</div>
                    <div className="text-xs text-muted-foreground">{item.product.category}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={`Decrease quantity for ${item.product.name}`}><Minus /></Button>
                      <span className="font-bold">{item.quantity}</span>
                      <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label={`Increase quantity for ${item.product.name}`}><Plus /></Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-accent">KSH {(item.product.price * item.quantity * 100).toFixed(2)}</div>
                    <Button size="icon" variant="ghost" onClick={() => removeItem(item.product.id)} aria-label={`Remove ${item.product.name} from cart`}><Trash2 className="text-destructive" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && (
            <>
              <div className="flex justify-between mt-6 text-lg font-bold text-primary">
                <span>Subtotal</span>
                <span>KSH {(subtotal * 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Delivery</span>
                <span>1–5 days</span>
              </div>
              <Button className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow-sm" onClick={() => setStep(2)}>
                Proceed to Shipping <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Step 2: Shipping Info
  const [shippingError, setShippingError] = useState("");
  const ShippingInfo = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-background to-muted/40 border-0 shadow-glow-md backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent"><MapPin className="h-7 w-7 text-accent" /> Shipping Info</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zone) {
              setShippingError("Please fill in all required fields.");
              return;
            }
            setShippingError("");
            setStep(3);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={shippingInfo.name} onChange={e => setShippingInfo(s => ({ ...s, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={shippingInfo.phone} onChange={e => setShippingInfo(s => ({ ...s, phone: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input value={shippingInfo.address} onChange={e => setShippingInfo(s => ({ ...s, address: e.target.value }))} required />
              </div>
              <div>
                <Label>City</Label>
                <Input value={shippingInfo.city} onChange={e => setShippingInfo(s => ({ ...s, city: e.target.value }))} required />
              </div>
              <div>
                <Label>Zone</Label>
                <Input value={shippingInfo.zone} onChange={e => setShippingInfo(s => ({ ...s, zone: e.target.value }))} required />
              </div>
            </div>
            <div className="mt-4">
              <Label>Delivery Method</Label>
              <div className="flex gap-3 mt-2">
                <Button type="button" variant={shippingInfo.method === "FAST" ? "default" : "outline"} onClick={() => setShippingInfo(s => ({ ...s, method: "FAST" }))}>🚀 Fast (1–2d)</Button>
                <Button type="button" variant={shippingInfo.method === "STANDARD" ? "default" : "outline"} onClick={() => setShippingInfo(s => ({ ...s, method: "STANDARD" }))}>🛸 Standard (3–5d)</Button>
                <Button type="button" variant={shippingInfo.method === "ECO" ? "default" : "outline"} onClick={() => setShippingInfo(s => ({ ...s, method: "ECO" }))}>🌿 Eco (pick date)</Button>
              </div>
              {shippingInfo.method === "ECO" && (
                <div className="mt-2">
                  <Label>Delivery Date</Label>
                  <Input type="date" value={shippingInfo.date} onChange={e => setShippingInfo(s => ({ ...s, date: e.target.value }))} />
                </div>
              )}
            </div>
            {shippingError && <div className="text-destructive text-center mt-2">{shippingError}</div>}
            <Button type="submit" className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow-sm">
              Proceed to Payment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  // Step 3: Payment & Confirmation
  const PaymentAndConfirm = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-background to-muted/40 border-0 shadow-glow-md backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent"><CreditCard className="h-7 w-7 text-accent" /> Payment & Confirm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button type="button" variant={paymentMethod === "stripe" ? "default" : "outline"} onClick={() => setPaymentMethod("stripe")}>Credit/Debit Card</Button>
              <Button type="button" variant={paymentMethod === "paypal" ? "default" : "outline"} onClick={() => setPaymentMethod("paypal")}>PayPal</Button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Lock className="text-green-500" />
              <span className="text-sm text-muted-foreground">100% Secure • SSL Encrypted</span>
            </div>
            <div className="bg-white/5 rounded-lg p-4 mt-4">
              <div className="flex justify-between text-primary font-semibold mb-2"><span>Order Total</span><span>KSH {(total * 100).toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground text-sm"><span>Shipping</span><span>KSH {(shipping * 100).toFixed(2)}</span></div>
            </div>
            <Button className="w-full mt-8 bg-accent hover:bg-accent/90 text-lg font-bold text-accent-foreground shadow-glow-sm" onClick={async () => {
              setOrderLoading(true);
              setOrderError("");
              
              // Validate shipping info
              if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zone) {
                setOrderError("Please complete all shipping information.");
                setOrderLoading(false);
                return;
              }

              // Validate email
              if (!session?.user?.email) {
                setOrderError("Email address is required for order confirmation.");
                setOrderLoading(false);
                return;
              }

              try {
                const res = await fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    shippingAddress: {
                      fullName: shippingInfo.name,
                      address: shippingInfo.address,
                      city: shippingInfo.city,
                      postalCode: shippingInfo.zone,
                      country: 'Kenya',
                      email: session.user.email,
                    },
                    paymentMethod,
                  }),
                });
                
                const data = await res.json();
                
                if (!res.ok) {
                  throw new Error(data.message || `Order failed (${res.status})`);
                }
                
                if (data.url) {
                  // Show success toast before redirect
                  toast({
                    title: "Redirecting to Payment",
                    description: `Taking you to ${paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'} to complete your order.`,
                  });
                  
                  // Add slight delay for better UX
                  setTimeout(() => {
                    window.location.href = data.url;
                  }, 1000);
                  return;
                }
                
                // If no URL returned, there's an issue
                throw new Error('Payment URL not received');
              } catch (err: any) {
                console.error('Order creation error:', err);
                setOrderError(err.message || 'Payment failed. Please try again.');
                
                // Show error toast
                toast({
                  title: "Order Failed",
                  description: err.message || 'Unable to create order. Please try again.',
                  variant: "destructive"
                });
              } finally {
                setOrderLoading(false);
              }
            }} disabled={orderLoading || items.length === 0} aria-label="Confirm and pay">
              {orderLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Order...</span>
                </div>
              ) : (
                <span>Confirm & Launch Order 🚀</span>
              )}
            </Button>
            {orderError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-3">
                <div className="text-destructive text-center text-sm font-medium">{orderError}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Sticky Order Summary
  const OrderSummary = () => (
    <div className="bg-gradient-to-br from-background to-muted/40 rounded-xl shadow-glow-md p-6 sticky top-8 animate-fade-in border border-accent/10">
      <h3 className="text-xl font-semibold mb-4 text-accent flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />Order Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-muted-foreground">
          <span>Products</span>
          <span>KSH {(subtotal * 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>KSH {(shipping * 100).toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount</span>
            <span>-KSH {(discount * 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-accent pt-2 border-t border-accent/20">
          <span>Total</span>
          <span>KSH {(total * 100).toFixed(2)}</span>
        </div>
        <div className="mt-4">
          <Label htmlFor="promoCode" className="text-sm font-medium">Promo Code</Label>
          <Input id="promoCode" placeholder="Enter code" />
        </div>
        <div className="mt-2 text-xs text-accent">Zizi says: Use code <b>ZIZOBABY10</b> for 10% off first order!</div>
      </div>
    </div>
  );

  // Progress bar
  const Progress = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((s, idx) => (
        <div key={s.label} className={`flex flex-col items-center ${step === idx + 1 ? 'text-accent' : 'text-muted-foreground'}`}>
          <div className={`rounded-full p-3 bg-white/10 shadow ${step === idx + 1 ? 'ring-2 ring-accent' : ''}`}>{s.icon}</div>
          <span className="mt-2 text-xs font-medium uppercase tracking-wider">{s.label}</span>
          {idx < steps.length - 1 && <div className="w-8 h-1 bg-gradient-to-r from-accent to-transparent rounded-full mt-2 mb-2" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#23234b] text-primary flex flex-col items-center justify-center py-8 px-2 md:px-0">
      <div className="max-w-5xl w-full grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Progress />
          <div className="rounded-xl bg-glass shadow-glow-lg p-8 animate-fade-in">
            {step === 1 && <CartReview />}
            {step === 2 && <ShippingInfo />}
            {step === 3 && <PaymentAndConfirm />}
          </div>
        </div>
        <div className="md:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

// Add to tailwind.config.js:
// keyframes: {
//   'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
//   'slide-in': { '0%': { transform: 'translateY(40px)', opacity: '0' }, '100%': { transform: 'none', opacity: '1' } },
// },
// animation: {
//   'fade-in': 'fade-in 0.5s ease',
//   'slide-in': 'slide-in 0.4s cubic-bezier(0.4,0,0.2,1)',
// },

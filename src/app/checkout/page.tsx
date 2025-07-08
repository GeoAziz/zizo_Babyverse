"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart.js";
import CreditCard from "lucide-react/dist/esm/icons/credit-card.js";
import Package from "lucide-react/dist/esm/icons/package.js";
import Lock from "lucide-react/dist/esm/icons/lock.js";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle.js";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.js";
import MapPin from "lucide-react/dist/esm/icons/map-pin.js";
import Trash2 from "lucide-react/dist/esm/icons/trash-2.js";
import Minus from "lucide-react/dist/esm/icons/minus.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import Loader2 from "lucide-react/dist/esm/icons/loader-2.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useCart } from '@/context/cart-context';
import type { CartItem as LibCartItem } from '@/lib/types';

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

  const [step, setStep] = React.useState(1);
  const [shippingInfo, setShippingInfo] = React.useState({ name: '', phone: '', address: '', city: '', zone: '', method: 'FAST', date: '' });
  const [paymentMethod, setPaymentMethod] = React.useState<'stripe' | 'paypal'>('stripe');
  const [orderLoading, setOrderLoading] = React.useState(false);
  const [orderError, setOrderError] = React.useState('');

  // Check for cancelled payment
  React.useEffect(() => {
    const cancelled = searchParams.get('cancelled');
    if (cancelled === '1') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive"
      });
      // Clear the URL parameter
      router.replace('/checkout');
    }
  }, [searchParams, toast, router]);

  // Auth-guard
  React.useEffect(() => {
    if (status === 'unauthenticated') router.push(`/login?callbackUrl=/checkout`);
  }, [status, router]);

// Step 1: Cart Review
// Remove local CartItem interface and use imported type
// interface CartItem {
//   id: string;
//   quantity: number;
//   product: {
//     id: string;
//     name: string;
//     price: number;
//     imageUrl: string;
//     category?: string;
//   };
// }

// Update CartReviewProps and PaymentAndConfirmProps to use LibCartItem
interface CartReviewProps {
  items: LibCartItem[];
  subtotal: number;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  setStep: (step: number) => void;
}

function CartReview({ items, subtotal, updateQuantity, removeItem, setStep }: CartReviewProps) {
  return (
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
              <Package size={48} className="mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-lg text-muted-foreground">Your cart is empty.</p>
              <Button asChild className="mt-4 bg-accent text-white" aria-label="Return to shop">
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item: LibCartItem) => (
                // Use item.product.id as key since item.id does not exist
                <li key={item.product.id} className="flex items-center gap-4 bg-white/5 rounded-lg p-3 animate-slide-in">
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
}

// Step 2: Shipping Info
interface ShippingInfoType {
  name: string;
  phone: string;
  address: string;
  city: string;
  zone: string;
  method: string;
  date: string;
}

interface ShippingInfoProps {
  shippingInfo: ShippingInfoType;
  setShippingInfo: React.Dispatch<React.SetStateAction<ShippingInfoType>>;
  setStep: (step: number) => void;
}

function ShippingInfo({ shippingInfo, setShippingInfo, setStep }: ShippingInfoProps) {
  const [shippingError, setShippingError] = React.useState("");
  return (
    <div className="space-y-6">
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
                <Input
                  value={shippingInfo.name}
                  onChange={e => {
                    // Use functional update with previous value to avoid focus loss
                    setShippingInfo(prev => ({ ...prev, name: e.target.value }));
                  }}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={shippingInfo.phone}
                  onChange={e => {
                    setShippingInfo(prev => ({ ...prev, phone: e.target.value }));
                  }}
                  required
                  autoComplete="tel"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={shippingInfo.address}
                  onChange={e => {
                    setShippingInfo(prev => ({ ...prev, address: e.target.value }));
                  }}
                  required
                  autoComplete="street-address"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={shippingInfo.city}
                  onChange={e => {
                    setShippingInfo(prev => ({ ...prev, city: e.target.value }));
                  }}
                  required
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <Label>Zone</Label>
                <Input
                  value={shippingInfo.zone}
                  onChange={e => {
                    setShippingInfo(prev => ({ ...prev, zone: e.target.value }));
                  }}
                  required
                  autoComplete="postal-code"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Delivery Method</Label>
              <div className="flex gap-3 mt-2">
                <Button type="button" variant={shippingInfo.method === "FAST" ? "default" : "outline"} onClick={() => setShippingInfo(prev => ({ ...prev, method: "FAST" }))}>🚀 Fast (1–2d)</Button>
                <Button type="button" variant={shippingInfo.method === "STANDARD" ? "default" : "outline"} onClick={() => setShippingInfo(prev => ({ ...prev, method: "STANDARD" }))}>🛸 Standard (3–5d)</Button>
                <Button type="button" variant={shippingInfo.method === "ECO" ? "default" : "outline"} onClick={() => setShippingInfo(prev => ({ ...prev, method: "ECO" }))}>🌿 Eco (pick date)</Button>
              </div>
              {shippingInfo.method === "ECO" && (
                <div className="mt-2">
                  <Label>Delivery Date</Label>
                  <Input
                    type="date"
                    value={shippingInfo.date}
                    onChange={e => {
                      setShippingInfo(prev => ({ ...prev, date: e.target.value }));
                    }}
                  />
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
}

// Step 3: Payment & Confirmation
interface PaymentAndConfirmProps {
  paymentMethod: 'stripe' | 'paypal';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'stripe' | 'paypal'>>;
  orderLoading: boolean;
  setOrderLoading: React.Dispatch<React.SetStateAction<boolean>>;
  orderError: string;
  setOrderError: React.Dispatch<React.SetStateAction<string>>;
  shippingInfo: ShippingInfoType;
  session: any;
  toast: any;
  total: number;
  shipping: number;
  items: LibCartItem[];
}

function PaymentAndConfirm({
  paymentMethod,
  setPaymentMethod,
  orderLoading,
  setOrderLoading,
  orderError,
  setOrderError,
  shippingInfo,
  session,
  toast,
  total,
  shipping,
  items
}: PaymentAndConfirmProps) {
  return (
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
              } catch (err) {
                console.error('Order creation error:', err);
                const errorMsg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
                setOrderError(errorMsg);
                // Show error toast
                toast({
                  title: "Order Failed",
                  description: errorMsg,
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
}

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
            {step === 1 && (
              <CartReview
                items={items}
                subtotal={subtotal}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                setStep={setStep}
              />
            )}
            {step === 2 && (
              <ShippingInfo
                shippingInfo={shippingInfo}
                setShippingInfo={setShippingInfo}
                setStep={setStep}
              />
            )}
            {step === 3 && (
              <PaymentAndConfirm
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                orderLoading={orderLoading}
                setOrderLoading={setOrderLoading}
                orderError={orderError}
                setOrderError={setOrderError}
                shippingInfo={shippingInfo}
                session={session}
                toast={toast}
                total={total}
                shipping={shipping}
                items={items}
              />
            )}
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

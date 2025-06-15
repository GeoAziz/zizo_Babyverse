
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Changed from 'next/navigation'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, CreditCard, Rocket, ShoppingBag, User, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Mock cart items for summary - in a real app, this would come from a cart context/state
const mockCartSummary = {
  items: [
    { name: 'Cosmic Comfort Diapers', quantity: 2, price: 29.99 },
    { name: 'Galaxy Glow Pacifier Set', quantity: 1, price: 12.50 },
  ],
  subtotal: (2 * 29.99) + 12.50,
  shipping: 5.99,
  total: (2 * 29.99) + 12.50 + 5.99,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Galaxy Prime',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNextStep = (e?: FormEvent) => {
    e?.preventDefault();
    // Add validation here if needed for each step
    if (currentStep === 1) { // Validate shipping
        if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
            toast({title: "Missing Shipping Info", description: "Please fill all shipping details.", variant: "destructive"});
            return;
        }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
     if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        toast({title: "Missing Payment Info", description: "Please fill all payment details.", variant: "destructive"});
        return;
    }
    // Mock order placement
    console.log("Order placed with:", { shippingInfo, paymentInfo, cart: mockCartSummary });
    toast({
      title: "Order Placed!",
      description: "Your BabyVerse goodies are preparing for launch! Redirecting to confirmation...",
    });
    // In a real app, you'd clear the cart and navigate
    router.push('/checkout/confirmation');
  };

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
            {/* Progress Indicator (Conceptual) */}
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
                   <div> {/* Placeholder for email if needed, or part of user account */}
                    <Label htmlFor="email-checkout">Email (for updates)</Label>
                    <Input id="email-checkout" name="email-checkout" type="email" placeholder="you@example.com" required />
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
                <h2 className="text-xl font-semibold text-primary">Payment Details (Mock)</h2>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" name="cardNumber" value={paymentInfo.cardNumber} onChange={handlePaymentChange} placeholder="**** **** **** 1234" required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                    <Input id="expiryDate" name="expiryDate" value={paymentInfo.expiryDate} onChange={handlePaymentChange} placeholder="MM/YY" required />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" name="cvv" value={paymentInfo.cvv} onChange={handlePaymentChange} placeholder="123" required />
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
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-primary">Review Your Cosmic Order</h2>
                <div>
                  <h3 className="font-medium text-muted-foreground mb-1">Shipping To:</h3>
                  <p>{shippingInfo.fullName}</p>
                  <p>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}</p>
                </div>
                 <div>
                  <h3 className="font-medium text-muted-foreground mb-1">Payment Method:</h3>
                  <p>Card ending in •••• {paymentInfo.cardNumber.slice(-4)}</p>
                </div>
                <p className="text-sm text-muted-foreground">By clicking "Place Order", you agree to our (conceptual) Terms of Service.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full sm:w-auto">Back to Payment</Button>
                    <Button onClick={handlePlaceOrder} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    Place Order & Launch! <Rocket className="ml-2 h-4 w-4" />
                    </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="md:col-span-1 bg-muted/30 p-6 border-t md:border-t-0 md:border-l">
            <h3 className="text-xl font-semibold mb-4 text-primary">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {mockCartSummary.items.map(item => (
                <div key={item.name} className="flex justify-between text-sm text-muted-foreground">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${mockCartSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>${mockCartSummary.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t mt-2">
                <span>Total</span>
                <span>${mockCartSummary.total.toFixed(2)}</span>
              </div>
            </div>
             <p className="text-xs text-muted-foreground mt-4">Have a promo code? Apply it in your <Link href="/cart" className="text-accent hover:underline">cart</Link>.</p>
          </aside>
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, XCircle, Package, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { clearCart } = useCart(); // Add cart context
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isPayPal = searchParams.get('paypal') === '1';
  const orderId = searchParams.get('orderId');
  const stripeSessionId = searchParams.get('session_id');
  const isCancelled = searchParams.get('cancelled') === '1';

  useEffect(() => {
    if (isCancelled) {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive"
      });
      router.push('/checkout');
      return;
    }

    const processPayment = async () => {
      try {
        setStatus('loading');
        
        if (isPayPal && orderId) {
          // Capture PayPal payment
          console.log('Processing PayPal payment for order:', orderId);
          
          const response = await fetch('/api/orders/capture-paypal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            setOrderDetails(data);
            setStatus('success');
            
            // Clear cart on successful payment
            clearCart();
            
            toast({
              title: "Payment Successful! 🚀",
              description: `Your order #${data.id} has been confirmed.`,
            });
          } else {
            throw new Error(data.message || 'PayPal payment capture failed');
          }
        } else if (stripeSessionId) {
          // Verify Stripe payment
          console.log('Processing Stripe payment for session:', stripeSessionId);
          
          const response = await fetch(`/api/orders/verify-stripe?session_id=${stripeSessionId}`);
          
          const data = await response.json();
          
          if (response.ok) {
            setOrderDetails(data);
            setStatus('success');
            
            // Clear cart on successful payment
            clearCart();
            
            toast({
              title: "Payment Successful! 🚀",
              description: `Your order #${data.id} has been confirmed.`,
            });
          } else {
            throw new Error(data.message || 'Stripe payment verification failed');
          }          } else {
            throw new Error('Invalid payment parameters');
          }
        } catch (error: any) {
          console.error('Payment processing error:', error);
          setStatus('error');
        
        // Retry logic for transient errors
        if (retryCount < 3 && (error.message?.includes('network') || error.message?.includes('timeout'))) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            processPayment();
          }, 2000 * (retryCount + 1)); // Exponential backoff
        } else {
          toast({
            title: "Payment Processing Error",
            description: error.message || "There was an issue processing your payment.",
            variant: "destructive"
          });
        }
      }
    };

    if ((isPayPal && orderId) || stripeSessionId) {
      processPayment();
    } else {
      setStatus('error');
    }
  }, [isPayPal, orderId, stripeSessionId, isCancelled, retryCount, toast, router]);

  const handleRetry = () => {
    setRetryCount(0);
    setStatus('loading');
    // Trigger useEffect again
    window.location.reload();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#23234b] flex items-center justify-center">
        <Card className="w-full max-w-md bg-gradient-to-br from-background to-muted/40 border-0 shadow-glow-md">
          <CardContent className="flex flex-col items-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-accent">Processing Your Order</h2>
            <p className="text-muted-foreground text-center">
              {retryCount > 0 
                ? `Retrying... (${retryCount}/3)` 
                : "Please wait while we confirm your payment and prepare your cosmic package..."
              }
            </p>
            <div className="mt-4 text-xs text-accent animate-pulse">
              🚀 Launching your order into the BabyVerse...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#23234b] flex items-center justify-center">
        <Card className="w-full max-w-md bg-gradient-to-br from-background to-muted/40 border-0 shadow-glow-md">
          <CardContent className="flex flex-col items-center py-8">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-primary">Payment Processing Issue</h2>
            <p className="text-muted-foreground text-center mb-6">
              We encountered an issue while processing your payment. Don't worry - if your payment went through, 
              we'll process your order and send you a confirmation email.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/checkout')}>
                Return to Checkout
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile?tab=orders">Check My Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#23234b] flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-background to-muted/40 border-0 shadow-glow-lg">
        <CardHeader className="text-center bg-green-500/10 rounded-t-lg">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-20 w-20 text-green-500 animate-pulse" />
          </div>
          <CardTitle className="text-3xl text-accent">Order Confirmed! 🚀</CardTitle>
          <p className="text-lg text-muted-foreground mt-2">
            Your BabyVerse package is now preparing for its cosmic journey!
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="text-center">
            <div className="bg-accent/10 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-2xl font-bold text-accent font-mono">#{orderDetails?.id || orderId}</p>
            </div>
            <p className="text-muted-foreground">
              Thank you for your order! We've sent a confirmation email with all the details.
            </p>
          </div>
          
          {orderDetails && (
            <div className="bg-muted/20 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-accent mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <p className="font-semibold text-lg">KSH {(orderDetails.totalAmount * 100).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <p className="font-semibold capitalize">{isPayPal ? 'PayPal' : 'Credit Card'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    ✓ Confirmed
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimated Delivery:</span>
                  <p className="font-semibold">1-5 business days</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-accent/5 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              🌟 <strong>What's Next?</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>📧 Check your email for order confirmation</li>
              <li>📦 We'll prepare your cosmic package</li>
              <li>🚚 You'll get tracking info when it ships</li>
              <li>🎉 Enjoy your BabyVerse goodies!</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1 bg-accent hover:bg-accent/90">
              <Link href="/products">
                Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/profile?tab=orders">
                View My Orders
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at{' '}
              <a href="mailto:support@zizobabyverse.com" className="text-accent hover:underline">
                support@zizobabyverse.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

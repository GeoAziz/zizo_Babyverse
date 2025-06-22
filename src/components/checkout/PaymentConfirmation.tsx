'use client';

import { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PaymentConfirmationProps {
  orderId: string;
  paymentMethod: 'card' | 'mpesa';
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentConfirmation({
  orderId,
  paymentMethod,
  onSuccess,
  onError
}: PaymentConfirmationProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payments/${orderId}/status`);
        if (!response.ok) throw new Error('Failed to check payment status');
        const data = await response.json();
        
        if (data.status === 'completed') {
          setStatus('success');
          onSuccess?.(orderId);
        } else if (data.status === 'failed') {
          setStatus('error');
          onError?.(data.message || 'Payment failed');
        }
      } catch (error) {
        console.error('Payment status check failed:', error);
        setStatus('error');
        onError?.('Could not verify payment status');
      }
    };

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 1000);

    // Check payment status every 3 seconds
    const statusInterval = setInterval(checkPaymentStatus, 3000);

    // Cleanup
    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, [orderId, onSuccess, onError]);

  useEffect(() => {
    if (status === 'success') {
      toast({
        title: "Payment Successful",
        description: "Your order has been confirmed!",
      });
    } else if (status === 'error') {
      toast({
        title: "Payment Failed",
        description: "There was a problem processing your payment.",
        variant: "destructive",
      });
    }
  }, [status, toast]);

  return (
    <div className="space-y-8 text-center">
      {status === 'processing' && (
        <>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold text-primary">
              Processing Payment
            </h2>
            <p className="text-muted-foreground">
              {paymentMethod === 'mpesa' 
                ? 'Please check your phone for the M-PESA prompt...'
                : 'Processing your card payment...'}
            </p>
          </div>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
        </>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h2 className="text-2xl font-semibold text-primary">
            Payment Successful
          </h2>
          <p className="text-muted-foreground max-w-md">
            Thank you for your purchase! Your order has been confirmed and is being processed.
          </p>
          <div className="flex gap-4 mt-4">
            <Button asChild>
              <Link href={`/profile/orders/${orderId}`}>
                View Order
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-semibold text-destructive">
            Payment Failed
          </h2>
          <p className="text-muted-foreground max-w-md">
            We couldn't process your payment. Please try again or choose a different payment method.
          </p>
          <div className="flex gap-4 mt-4">
            <Button variant="destructive" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cart">
                Return to Cart
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
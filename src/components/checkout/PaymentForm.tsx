'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Smartphone } from 'lucide-react';

const paymentFormSchema = z.object({
  method: z.enum(['card', 'mpesa']),
  cardNumber: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
  phoneNumber: z.string().optional(),
}).refine((data) => {
  if (data.method === 'card') {
    return data.cardNumber && data.expiryMonth && data.expiryYear && data.cvv;
  }
  if (data.method === 'mpesa') {
    return data.phoneNumber;
  }
  return true;
}, {
  message: "Please fill in all required fields for the selected payment method",
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function PaymentForm({ onSubmit, onCancel }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      method: 'card',
    },
  });

  const paymentMethod = form.watch('method');

  const handleSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: "Payment Initiated",
        description: "Processing your payment...",
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        value="card"
                        className="peer sr-only"
                      />
                    </FormControl>
                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      <CreditCard className="mb-3 h-6 w-6" />
                      Credit Card
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        value="mpesa"
                        className="peer sr-only"
                      />
                    </FormControl>
                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      <Smartphone className="mb-3 h-6 w-6" />
                      M-PESA
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentMethod === 'card' && (
          <>
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input placeholder="4111 1111 1111 1111" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="expiryMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                      <Input placeholder="MM" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="YY" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input placeholder="123" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {paymentMethod === 'mpesa' && (
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>M-PESA Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+254..." {...field} />
                </FormControl>
                <FormDescription>
                  Enter the M-PESA registered phone number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {paymentMethod === 'card' ? 'Pay Now' : 'Send M-PESA Prompt'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
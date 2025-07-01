'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Baby } from '@prisma/client';
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const babyFormSchema = z.object({
  name: z.string().min(1, "Baby's name is required"),
  ageInMonths: z.coerce.number()
    .min(0, "Age must be non-negative")
    .max(60, "Age must be 60 months or less"),
  weightInKilograms: z.coerce.number()
    .min(0.5, "Weight must be at least 0.5 kg")
    .max(30, "Weight must be 30 kg or less")
    .optional()
    .nullable(),
  allergies: z.string().max(500).optional().nullable(),
  preferences: z.string().max(500).optional().nullable(),
});

type BabyFormValues = z.infer<typeof babyFormSchema>;

interface BabyProfileFormProps {
  baby?: Baby;
  onSubmit: (data: BabyFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function BabyProfileForm({ baby, onSubmit, onCancel }: BabyProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BabyFormValues>({
    resolver: zodResolver(babyFormSchema),
    defaultValues: {
      name: baby?.name || "",
      ageInMonths: baby?.ageInMonths || 0,
      weightInKilograms: baby?.weightInKilograms || null,
      allergies: baby?.allergies || "",
      preferences: baby?.preferences || "",
    },
  });

  const handleSubmit = async (data: BabyFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: baby ? "Profile Updated" : "Profile Created",
        description: `${data.name}'s profile has been ${baby ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving the profile.",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Baby's Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ageInMonths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age (in months)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                Enter age in months (0-60)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weightInKilograms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Optional: Enter weight in kilograms
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                List any allergies or sensitivities
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferences</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                Note any preferences or special needs
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {baby ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
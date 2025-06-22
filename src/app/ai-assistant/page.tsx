'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, Package, Loader2, AlertTriangle, ShoppingCart } from 'lucide-react';
// import { productBundler, type ProductBundlerInput, type ProductBundlerOutput } from '@/ai/flows/product-bundler'; // No longer direct import
import type { ProductBundlerOutput } from '@/ai/flows/product-bundler'; // Keep type
import type { BabyNeedsForm } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { BundleVisualizer } from '@/components/ai/BundleVisualizer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AiAssistantPage() {
  const [formData, setFormData] = useState<BabyNeedsForm>({
    babyName: '',
    ageInMonths: '',
    weightInKilograms: '',
    allergies: '',
    preferences: '',
  });
  const [recommendation, setRecommendation] = useState<ProductBundlerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const handleAddBundleToCart = async () => {
    if (!recommendation || !session) {
      toast({ 
        title: "Please Login", 
        description: "You need to be logged in to add items to your cart.",
        variant: "destructive" 
      });
      router.push('/login?callbackUrl=/ai-assistant');
      return;
    }

    setIsLoading(true);
    try {
      // Add each product in the bundle to cart
      for (const productId of recommendation.productIds) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: 1 }),
        });
      }
      
      toast({
        title: "Bundle Added to Cart!",
        description: "All items from the bundle have been added to your cart.",
      });
      
      // Trigger cart update event
      window.dispatchEvent(new CustomEvent('cartUpdate'));
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Could not add bundle to cart.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    const ageInMonthsNum = parseInt(formData.ageInMonths, 10);
    const weightInKilogramsNum = parseFloat(formData.weightInKilograms);

    if (isNaN(ageInMonthsNum) || ageInMonthsNum <= 0) {
      setError('Please enter a valid age in months.');
      setIsLoading(false);
      return;
    }
    if (isNaN(weightInKilogramsNum) || weightInKilogramsNum <= 0) {
      setError('Please enter a valid weight in kilograms.');
      setIsLoading(false);
      return;
    }

    const apiInput = {
      babyName: formData.babyName,
      ageInMonths: ageInMonthsNum,
      weightInKilograms: weightInKilogramsNum,
      allergies: formData.allergies || 'None',
      preferences: formData.preferences || 'None',
    };

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiInput),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get recommendations from API');
      }

      const result: ProductBundlerOutput = await response.json();
      setRecommendation(result);
    } catch (e: any) {
      console.error('Error fetching recommendations:', e);
      setError(e.message || 'Zizi encountered a cosmic glitch. Please try again later.');
      toast({
        title: "Error",
        description: e.message || "Failed to get recommendations. Please check your input or try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-md shadow-glow-md border-accent/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-accent/20 rounded-full w-fit animate-pulse-glow">
            <Bot size={48} className="text-accent" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Zizi - Your AI Baby Assistant</CardTitle>
          <CardDescription className="text-muted-foreground">
            Tell Zizi about your little star, and get personalized product bundle recommendations!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="babyName" className="font-semibold">Baby&apos;s Name</Label>
                <Input id="babyName" name="babyName" value={formData.babyName} onChange={handleChange} placeholder="e.g., Astro" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageInMonths" className="font-semibold">Age (in months)</Label>
                <Input id="ageInMonths" name="ageInMonths" type="number" value={formData.ageInMonths} onChange={handleChange} placeholder="e.g., 6" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightInKilograms" className="font-semibold">Weight (in kg)</Label>
                <Input id="weightInKilograms" name="weightInKilograms" type="number" step="0.1" value={formData.weightInKilograms} onChange={handleChange} placeholder="e.g., 7.5" required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="allergies" className="font-semibold">Allergies (comma-separated)</Label>
                <Input id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g., Dairy, Peanuts" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferences" className="font-semibold">Preferences or Specific Needs</Label>
              <Textarea id="preferences" name="preferences" value={formData.preferences} onChange={handleChange} placeholder="e.g., Prefers soft toys, Organic fabrics only" />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Get Zizi&apos;s Recommendations
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="mt-8 bg-destructive/10 border-destructive text-destructive max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5" /> Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {recommendation && (
        <div className="mt-8 max-w-4xl mx-auto">
          <BundleVisualizer
            bundle={recommendation}
            onAddToCart={handleAddBundleToCart}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

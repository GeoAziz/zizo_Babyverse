'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Star, ArrowLeft, ShoppingCart, Trash2, PackagePlus, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent('/profile/wishlist')}`);
    } else if (status === 'authenticated') {
      fetchWishlistItems();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const fetchWishlistItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/wishlist');
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist items');
      }
      const data: Product[] = await response.json();
      setWishlistItems(data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({ title: "Error", description: "Could not load your wishlist.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    const originalWishlist = [...wishlistItems];
    const itemToRemove = wishlistItems.find(item => item.id === productId);
    
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));

    try {
      const response = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
      if (!response.ok) {
        // Revert optimistic update
        setWishlistItems(originalWishlist);
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item');
      }
      if (itemToRemove) {
        toast({ title: `${itemToRemove.name} removed from wishlist`, variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Error removing from wishlist:", error);
      toast({ title: "Error", description: error.message || "Could not remove item from wishlist.", variant: "destructive" });
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!session) {
      toast({ title: "Please Login", description: "You need to be logged in to add items to your cart.", variant: "destructive" });
      router.push(`/login?callbackUrl=/profile/wishlist`);
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }
      toast({
        title: `${product.name} added to cart!`,
        description: "Your little star will love it!",
      });
      // Trigger cart update
      window.dispatchEvent(new CustomEvent('cartUpdate'));
      // Remove from wishlist after adding to cart
      await handleRemoveFromWishlist(product.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not add to cart.", variant: "destructive" });
    }
  };

  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Polishing your star collection...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Button variant="outline" asChild className="mb-8">
        <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile</Link>
      </Button>

      <Card className="shadow-glow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <Star className="mr-3 h-8 w-8 text-yellow-400 fill-yellow-400" /> My Cosmic Wishlist
          </CardTitle>
          <CardDescription>Your saved treasures from across the BabyVerse.</CardDescription>
        </CardHeader>
        <CardContent>
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((product) => (
                <Card key={product.id} className="group flex flex-col overflow-hidden shadow-card-glow hover:shadow-glow-md transition-all duration-300">
                  <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden relative">
                    <Image
                      src={product.imageUrl || 'https://placehold.co/400x400.png'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      data-ai-hint={product.dataAiHint || product.category?.toLowerCase() || 'product'}
                    />
                  </Link>
                  <CardContent className="p-4 flex-grow">
                    <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">
                      <Link href={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="text-xl font-bold text-accent mt-1">${product.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter className="p-4 border-t flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={() => handleAddToCart(product)}>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveFromWishlist(product.id)} className="text-destructive border-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <PackagePlus size={72} className="text-muted-foreground mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-semibold text-primary mb-3">Your Wishlist is Empty</h2>
              <p className="text-muted-foreground mb-6">
                Explore the BabyVerse and add some cosmic wonders to your list!
              </p>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/products">Discover Products</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

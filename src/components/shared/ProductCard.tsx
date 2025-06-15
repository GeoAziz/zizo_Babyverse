
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, ShoppingCart, Eye, Heart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!session) {
      toast({ title: "Please Login", description: "You need to be logged in to add items to your cart.", variant: "destructive" });
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }
    setIsAddingToCart(true);
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
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not add to cart.", variant: "destructive" });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!session) {
      toast({ title: "Please Login", description: "You need to be logged in to add items to your wishlist.", variant: "destructive" });
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }
    setIsWishlisting(true);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to wishlist');
      }
      toast({
        title: response.status === 201 ? "Added to Wishlist!" : "Already in Wishlist!",
        description: `${product.name} ${response.status === 201 ? 'is now in your wishlist.' : 'was already in your wishlist.'}`,
      });
    } catch (error: any) {
      console.error("Error adding to wishlist:", error);
      toast({ title: "Error", description: error.message || "Could not add to wishlist.", variant: "destructive" });
    } finally {
      setIsWishlisting(false);
    }
  };

  return (
    <Card className="group flex flex-col h-full overflow-hidden shadow-card-glow hover:shadow-glow-md transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden">
          <Image
            src={product.imageUrl || 'https://placehold.co/400x400.png'}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
            data-ai-hint={product.dataAiHint || product.category?.toLowerCase() || 'product'}
          />
        </Link>
        {product.tags?.includes('Bestseller') && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded animate-pulse-glow z-10">
            Bestseller
          </span>
        )}
         <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 bg-card/70 hover:bg-card text-primary hover:text-accent rounded-full z-10 h-8 w-8"
            onClick={handleAddToWishlist}
            aria-label="Add to wishlist"
            disabled={isWishlisting}
        >
            {isWishlisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1 leading-tight group-hover:text-accent transition-colors">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">
          {product.description?.substring(0, 60)}...
        </CardDescription>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-semibold text-primary">${product.price.toFixed(2)}</p>
          {product.averageRating && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
              {product.averageRating.toFixed(1)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <Button asChild variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/10 hover:text-primary group/button">
          <Link href={`/products/${product.id}`}>
            <Eye className="mr-2 h-4 w-4 group-hover/button:text-primary transition-colors" /> View
          </Link>
        </Button>
        <Button 
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" 
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock === 0}
        >
          {isAddingToCart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}


'use client'; // Add this to use hooks like useToast

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast(); // Initialize toast

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation if button is inside a link wrapper
    // Mock add to cart logic
    console.log(`Added ${product.name} to cart`);
    toast({
      title: `${product.name} added to cart!`,
      description: "Your little star will love it!",
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Mock add to wishlist logic
    console.log(`Added ${product.name} to wishlist`);
    toast({
      title: `${product.name} added to wishlist!`,
      description: "Saved for later cosmic adventures.",
    });
  };

  return (
    <Card className="group flex flex-col h-full overflow-hidden shadow-card-glow hover:shadow-glow-md transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
            data-ai-hint={product.dataAiHint || product.category.toLowerCase()}
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
        >
            <Heart className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1 leading-tight group-hover:text-accent transition-colors">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">
          {product.description.substring(0, 60)}...
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
        <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

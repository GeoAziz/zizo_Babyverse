
'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, CheckCircle, Info, Tag, ArrowLeft, Minus, Plus, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(paramsPromise);
  const { id: productId } = resolvedParams;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          if (response.status === 404) {
            // Product not found - this is an expected state.
            // Set product to null to trigger the "Product Not Found" UI.
            // No need to throw an error that gets logged by console.error for this specific case.
            setProduct(null);
          } else {
            // For other errors (e.g., 500), it's good to throw so it gets logged.
            const errorData = await response.json().catch(() => ({ message: "API request failed" })); // Try to get error message from API
            throw new Error(errorData.message || `API request failed with status ${response.status}`);
          }
        } else {
          const data: Product = await response.json();
          setProduct(data);
        }
      } catch (error) { // This will now primarily catch network errors or non-404 API errors
        console.error("Error fetching product details:", error);
        setProduct(null);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!session) {
      toast({ title: "Please Login", description: "You need to be logged in to add items to your cart.", variant: "destructive" });
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }
    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }
      toast({
        title: `${product.name} added to cart!`,
        description: `Quantity: ${quantity}. Your little star will love it!`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not add to cart.", variant: "destructive" });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    if (!session) {
      toast({ title: "Please Login", description: "You need to be logged in to add items to your wishlist.", variant: "destructive" });
      router.push(`/login?callbackUrl=/products/${product.id}`);
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

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
        setQuantity(prev => prev + 1);
    } else if (product && quantity >= product.stock) {
        toast({ title: "Max Stock Reached", description: `Only ${product.stock} units available.`, variant: "destructive"});
    }
  }
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Summoning product details from the cosmos...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Info size={64} className="text-destructive mb-4" />
        <h1 className="text-3xl font-headline font-bold text-primary mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">Oops! We couldn't find the product you're looking for in this galaxy.</p>
        <Button asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Products</Link>
      </Button>
      <Card className="overflow-hidden shadow-glow-lg">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square bg-muted/30">
            <Image
              src={product.imageUrl || 'https://placehold.co/600x600.png'}
              alt={product.name}
              fill
              className="object-contain p-4 md:p-8"
              data-ai-hint={product.dataAiHint || product.category?.toLowerCase() || 'product'}
            />
          </div>
          <div className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-3xl md:text-4xl font-headline text-primary">{product.name}</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">{product.category}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddToWishlist}
                  className="text-primary hover:text-accent rounded-full ml-4 shrink-0"
                  disabled={isWishlisting}
                  aria-label="Add to wishlist"
                >
                    {isWishlisting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className="h-6 w-6"/>}
                </Button>
              </div>
              {product.averageRating && (
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.round(product.averageRating!) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`} />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">({product.averageRating.toFixed(1)} out of 5 stars)</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-2xl font-semibold text-accent">${product.price.toFixed(2)}</p>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{product.description}</p>

              {product.features && product.features.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-1">Features:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {typeof product.features === 'string'
                        ? product.features.split(',').map(f => f.trim()).map((feature, idx) => <li key={idx}>{feature}</li>)
                        : product.features.map((feature, idx) => <li key={idx}>{feature}</li>)
                    }
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {product.tags?.map(tag => (
                  <Badge key={tag} variant={tag === 'Bestseller' ? "default" : "secondary"} className="capitalize shadow-sm">
                    <Tag className="mr-1 h-3 w-3" /> {tag}
                  </Badge>
                ))}
                {product.ecoTag && (
                   <Badge variant="outline" className="border-green-500 text-green-600 shadow-sm">
                    <CheckCircle className="mr-1 h-3 w-3" /> Eco-Friendly
                  </Badge>
                )}
              </div>
               <p className="text-sm text-muted-foreground">
                Availability: <span className={product.stock > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                </span>
              </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 items-stretch p-6 bg-muted/20">
              <div className="flex items-center border border-input rounded-md">
                <Button variant="ghost" size="icon" onClick={decrementQuantity} className="rounded-r-none border-r border-input hover:bg-primary/10">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                 <Button variant="ghost" size="icon" onClick={incrementQuantity} className="rounded-l-none border-l border-input hover:bg-primary/10">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105"
              >
                {isAddingToCart ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cosmic Cart'}
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}

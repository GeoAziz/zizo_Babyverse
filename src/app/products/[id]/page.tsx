
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { mockProducts } from '@/lib/mockData';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, CheckCircle, Info, Tag, ArrowLeft, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const foundProduct = mockProducts.find(p => p.id === params.id);
    setProduct(foundProduct || null);
  }, [params.id]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Info size={64} className="text-destructive mb-4" />
        <h1 className="text-3xl font-headline font-bold text-primary mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">Oops! We couldn&apos;t find the product you&apos;re looking for.</p>
        <Button asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Placeholder for actual add to cart logic
    console.log(`Added ${quantity} of ${product.name} to cart`);
    toast({
      title: `${product.name} added to cart!`,
      description: `Quantity: ${quantity}. Your little star will love it!`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));


  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Products</Link>
      </Button>
      <Card className="overflow-hidden shadow-glow-lg">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square bg-muted/30">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4 md:p-8"
              data-ai-hint={product.dataAiHint || product.category.toLowerCase()}
            />
          </div>
          <div className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl md:text-4xl font-headline text-primary">{product.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">{product.category}</CardDescription>
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
              <p className="text-foreground leading-relaxed">{product.description}</p>
              
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
                disabled={product.stock === 0}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> {product.stock > 0 ? 'Add to Cosmic Cart' : 'Out of Stock'}
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}

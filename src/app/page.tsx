'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, Zap, ShoppingBag, Star, MessageCircle, Loader2 } from 'lucide-react';
import { mockFeaturedCollections, mockTestimonials } from '@/lib/mockData';
import ProductCard from '@/components/shared/ProductCard';
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';

export default function Home() {
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productFetchError, setProductFetchError] = useState<string | null>(null);
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductFetchError(null);
    try {
      const response = await fetch('/api/products?limit=4');
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to fetch latest products';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || `Failed to fetch latest products. Status: ${response.status}`;
        } else {
          errorMessage = `Failed to fetch latest products. Status: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setLatestProducts(data);
    } catch (error) {
      console.error("Error fetching latest products:", error);
      setProductFetchError((error as Error).message || "Could not load products. Please try again later.");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array since fetchProducts is defined inside component

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative text-center py-16 md:py-24 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-secondary shadow-glow-lg">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="https://placehold.co/1200x600.png" 
            alt="Animated baby capsule gliding into a sci-fi nursery" 
            fill
            className="object-cover animate-pulse-glow"
            data-ai-hint="baby capsule space" 
          />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 text-primary-foreground animate-slide-in [animation-delay:0.2s]">
            Welcome to <span className="text-accent">BabyVerse</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-slide-in [animation-delay:0.4s]">
            Embark on a futuristic journey of parenthood. Discover AI-powered insights and cosmic-class products for your little star.
          </p>
          <div className="space-x-4 animate-slide-in [animation-delay:0.6s]">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" /> Shop Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-accent text-accent hover:bg-accent/10 shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105">
              <Link href="/ai-assistant">
                <Bot className="mr-2 h-5 w-5" /> Scan My Baby's Needs
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="text-primary-foreground hover:text-accent hover:bg-transparent transition-all duration-300">
              <Link href="/#deals">
                <Zap className="mr-2 h-5 w-5" /> Explore Deals
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Assistant Preview */}
      <section id="ai-preview" className="container mx-auto px-4 py-12">
         <Card className="bg-card/80 backdrop-blur-sm shadow-card-glow hover:shadow-glow-md transition-shadow duration-300">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="p-3 bg-accent/20 rounded-full animate-pulse-glow">
              <Bot size={48} className="text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-headline font-semibold mb-2 text-primary">Meet Zizi, Your AI Nanny!</h3>
              <p className="text-muted-foreground mb-3">
                Need help finding the perfect products or have a question about baby care? Zizi is here to assist you 24/7.
              </p>
              <Button asChild variant="link" className="text-accent p-0 h-auto">
                <Link href="/ai-assistant">
                  Chat with Zizi <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Featured Collections */}
      <section id="featured-collections" className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-headline font-bold text-center mb-10 text-primary">Featured Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockFeaturedCollections.map((collection) => (
            <Link href={collection.link} key={collection.name} className="group block">
              <Card className="overflow-hidden shadow-card-glow hover:shadow-glow-md transition-all duration-300 transform group-hover:scale-105">
                <CardHeader className="p-0">
                  <Image 
                    src={collection.imageUrl} 
                    alt={collection.name} 
                    width={400} 
                    height={300} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={collection.dataAiHint}
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-xl font-headline group-hover:text-accent transition-colors">{collection.name}</CardTitle>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      
      {/* New Arrivals / Hot Products Section Example */}
      <section id="deals" className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-headline font-bold text-center mb-10 text-primary">New Arrivals & Hot Deals</h2>
        {isLoadingProducts ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Summoning latest products...</p>
          </div>
        ) : productFetchError ? (
           <div className="text-center py-10">
            <p className="text-destructive font-semibold">Error Loading Products</p>
            <p className="text-sm text-muted-foreground">{productFetchError}</p>
           </div>
        ) : latestProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">No new arrivals beamed in yet. Check back soon!</p>
        )}
         <div className="text-center mt-8">
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105">
            <Link href="/products">
              View All Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonial Galaxy */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline font-bold text-center mb-10 text-primary">From Our Parent Galaxy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-card shadow-card-glow hover:shadow-glow-md transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    {testimonial.imageUrl && (
                       <Image 
                        src={testimonial.imageUrl} 
                        alt={testimonial.name} 
                        width={60} 
                        height={60} 
                        className="rounded-full mr-4 border-2 border-accent"
                        data-ai-hint={testimonial.dataAiHint || 'person portrait'}
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg font-headline">{testimonial.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < testimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                </CardContent>
                <CardFooter>
                  <MessageCircle className="h-4 w-4 text-accent mr-2"/> 
                  <span className="text-xs text-accent">Verified Review</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


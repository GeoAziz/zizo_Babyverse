
'use client';

import { useEffect, useState, use, Suspense } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ShoppingCart, Heart, Loader2, ArrowLeft, Minus, Plus, Info, ThumbsUp, Leaf, ShieldCheck, MessageSquare, UserCircle, PackageCheck, ClipboardList, Settings2, Truck, Undo2, Sparkles, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/shared/ProductCard';
// Removed mockProducts import as suggested products should also come from API or be handled differently

// Mock data for sections not yet backed by API (can be removed if reviews are fetched)
const mockReviews = [
  { id: 'rev1', userName: 'CosmoParent1', babyAge: '6 months', rating: 5, comment: 'Absolutely essential for any new parent in the Andromeda sector! Our little star sleeps so soundly now.' },
  { id: 'rev2', userName: 'GalaxyMom', babyAge: '3 months', rating: 4, comment: 'Great product, very innovative. Shipping took a bit longer than light speed though.' },
];

function ProductDetailPageContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchProductAndSuggestions = async () => {
      if (!productId) return;
      setIsLoadingProduct(true);
      setError(null);
      try {
        // Fetch main product
        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) {
          const errorData = await productResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to load product. Status: ${productResponse.status}`);
        }
        const productData: Product = await productResponse.json();
        setProduct(productData);

        // Fetch suggested products (e.g., from the same category, excluding current product)
        if (productData.category) {
          const suggestionsResponse = await fetch(`/api/products?category=${encodeURIComponent(productData.category)}&limit=5`); // Fetch 5, filter current
          if (suggestionsResponse.ok) {
            let suggestions: Product[] = await suggestionsResponse.json();
            suggestions = suggestions.filter(p => p.id !== productId).slice(0, 4); // Exclude current, take 4
            setSuggestedProducts(suggestions);
          }
        }

      } catch (e: any) {
        console.error("Error fetching product details:", e);
        setError(e.message || "An unexpected error occurred.");
        setProduct(null);
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductAndSuggestions();
  }, [productId, toast]);

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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-20 w-20 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">Summoning product details from the cosmos...</p>
      </div>
    );
  }

  if (error) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
        <Button variant="outline" asChild className="absolute top-28 left-4 md:left-8">
          <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Products</Link>
        </Button>
        <AlertTriangle size={72} className="text-destructive mb-6" />
        <h1 className="text-4xl font-headline font-bold text-primary mb-3">Houston, We Have a Problem!</h1>
        <p className="text-lg text-muted-foreground mb-4">We encountered an issue trying to fetch this product's details.</p>
        <p className="text-sm text-destructive mb-8">{error}</p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
          <Link href="/products">
            Back to All Products
          </Link>
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
         <Button variant="outline" asChild className="absolute top-28 left-4 md:left-8">
            <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Products</Link>
        </Button>
        <Package size={72} className="text-muted-foreground mb-6" />
        <h1 className="text-4xl font-headline font-bold text-primary mb-3">Product Lost in Space</h1>
        <p className="text-lg text-muted-foreground mb-8">Oops! We couldn't find this product. It might have drifted into another dimension.</p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
          <Link href="/products">
            Explore Other Galaxies (Products)
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-12">
        <Button variant="outline" asChild className="mb-0">
            <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Products</Link>
        </Button>

      <section className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-square group">
            <Image
              src={product.imageUrl || 'https://placehold.co/800x800.png'}
              alt={product.name}
              fill
              className="object-contain p-4 md:p-8 rounded-lg shadow-glow-md bg-card/50 transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint || product.category?.toLowerCase() || 'product'}
            />
            <Button variant="outline" className="absolute bottom-4 right-4 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" disabled>
                Zoom (Soon)
            </Button>
             <Button variant="outline" className="absolute top-4 left-4 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" disabled>
                Try in AR (Soon)
            </Button>
        </div>

        <div className="space-y-6">
          <Card className="shadow-glow-sm border-primary/20">
            <CardHeader>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary leading-tight" style={{textShadow: '0 0 5px hsl(var(--primary-foreground)/0.3)'}}>{product.name}</h1>
              <CardDescription className="text-md text-muted-foreground pt-1">
                {product.description ? 
                  (product.description.length > 150 ? `${product.description.substring(0,150)}... (see details below)` : product.description)
                  : 'The finest in the galaxy for your little one.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-accent-foreground">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-accent">Zizi's Wisdom:</span>
                </div>
                <p className="text-sm text-accent">This {product.category.toLowerCase()} is perfect for {product.targetAudience || 'young explorers'} and is known for its {product.keywords || 'cosmic comfort'}!</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-6 w-6 ${i < Math.round(product.averageRating || 0) ? 'text-yellow-400 fill-yellow-400 shadow-sm' : 'text-muted-foreground/30'}`} />
                  ))}
                  <span className="ml-1 text-sm text-muted-foreground">({(product.averageRating || 0).toFixed(1)} stars, {Math.floor(Math.random() * 100) + 50} reviews)</span>
                  <Link href="#reviews" className="text-sm text-accent hover:underline ml-auto">📝 Read Reviews</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/50"><ThumbsUp className="mr-1 h-4 w-4"/>95% Recommend</Badge>
                  {product.ecoTag && <Badge variant="secondary" className="bg-teal-500/20 text-teal-700 border-teal-500/50"><Leaf className="mr-1 h-4 w-4"/>Eco-Friendly</Badge>}
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 border-blue-500/50"><ShieldCheck className="mr-1 h-4 w-4"/>Hypoallergenic (Mock)</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-4xl font-bold text-accent mb-4" style={{textShadow: '0 0 8px hsl(var(--accent)/0.5)'}}>${product.price.toFixed(2)}</p>
                 <div className="flex flex-col sm:flex-row gap-3 items-stretch mb-4">
                    <div className="flex items-center border border-input rounded-md">
                        <Button variant="ghost" size="icon" onClick={decrementQuantity} className="rounded-r-none border-r border-input hover:bg-primary/10 h-11 w-11">
                        <Minus className="h-5 w-5" />
                        </Button>
                        <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                        <Button variant="ghost" size="icon" onClick={incrementQuantity} className="rounded-l-none border-l border-input hover:bg-primary/10 h-11 w-11">
                        <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground sm:self-center">
                        Stock: <span className={product.stock > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {product.stock > 0 ? `${product.stock} units ready for launch` : 'Temporarily out of stock'}
                        </span>
                    </p>
                 </div>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isAddingToCart}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105"
                  >
                    {isAddingToCart ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cosmic Cart'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToWishlist}
                    className="text-primary hover:text-accent hover:border-accent border-2 border-primary"
                    disabled={isWishlisting}
                    aria-label="Add to wishlist"
                  >
                    {isWishlisting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5"/>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-card border border-border shadow-sm p-1 rounded-lg">
            <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm"><ClipboardList className="mr-2 h-4 w-4"/>Description</TabsTrigger>
            <TabsTrigger value="specifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm"><Settings2 className="mr-2 h-4 w-4"/>Specifications</TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm"><PackageCheck className="mr-2 h-4 w-4"/>What's In The Box</TabsTrigger>
            <TabsTrigger value="shipping" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm"><Truck className="mr-2 h-4 w-4"/>Shipping</TabsTrigger>
            <TabsTrigger value="returns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm"><Undo2 className="mr-2 h-4 w-4"/>Returns</TabsTrigger>
          </TabsList>
          <Card className="mt-4 shadow-md border-border">
            <CardContent className="p-6">
              <TabsContent value="description">
                <h3 className="text-xl font-semibold mb-3 text-primary">Full Product Description</h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{product.description || "No detailed description available for this cosmic marvel yet."}</p>
                 {product.features && (
                    <div className="mt-4">
                    <h4 className="font-semibold text-primary mb-1">Key Features:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {typeof product.features === 'string'
                            ? product.features.split(',').map(f => f.trim()).filter(f => f).map((feature, idx) => <li key={idx}>{feature}</li>)
                            : Array.isArray(product.features) ? product.features.map((feature, idx) => <li key={idx}>{feature}</li>) : null
                        }
                    </ul>
                    </div>
                )}
              </TabsContent>
              <TabsContent value="specifications">
                <h3 className="text-xl font-semibold mb-3 text-primary">Product Specifications</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Material:</strong> {product.keywords || 'Cosmic-grade polymers, Martian Cotton (Mock)'}</li>
                  <li><strong>Age Range:</strong> {product.ageGroup || '0-Galaxy Years'}</li>
                  <li><strong>Dimensions:</strong> Approx. 10 AU x 5 AU (Astronomical Units - Mock)</li>
                  <li><strong>Weight:</strong> 0.5 Earth Pounds (Mock)</li>
                  <li><strong>Origin Galaxy:</strong> Triangulum (Mock)</li>
                </ul>
              </TabsContent>
              <TabsContent value="inbox">
                <h3 className="text-xl font-semibold mb-3 text-primary">What's Included</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>1 x {product.name}</li>
                  <li>1 x Galactic Instruction Manual</li>
                  <li>Universal Power Adapter (if applicable)</li>
                  <li>Stardust of Joy (Conceptual)</li>
                </ul>
              </TabsContent>
              <TabsContent value="shipping">
                <h3 className="text-xl font-semibold mb-3 text-primary">Shipping &amp; Delivery</h3>
                <p className="text-muted-foreground">Standard Galactic Shipping: 3-5 Earth Days. Express Warp Speed: 1-2 Earth Days.</p>
                <p className="text-muted-foreground mt-2">Tracking information will be beamed to your registered email upon dispatch.</p>
              </TabsContent>
              <TabsContent value="returns">
                <h3 className="text-xl font-semibold mb-3 text-primary">Return Policy</h3>
                <p className="text-muted-foreground">30-day return window from the day your package lands. Item must be in its original space-worthy packaging. Some restrictions apply to personalized wormholes.</p>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-headline font-bold text-center mb-8 text-primary">Zizi Thinks You Might Also Like...</h2>
        {suggestedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {suggestedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-center mt-4 text-muted-foreground italic">Zizi is pondering other cosmic wonders for you...</p>
        )}
      </section>

      <section id="reviews" className="py-8">
        <h2 className="text-2xl font-headline font-bold text-center mb-8 text-primary">Echoes from the Parent Galaxy (Reviews)</h2>
        <div className="space-y-6">
          {mockReviews.map(review => (
            <Card key={review.id} className="shadow-card-glow hover:shadow-glow-md transition-shadow duration-300 bg-card/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-8 w-8 text-accent" />
                    <div>
                        <p className="font-semibold text-primary">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">Baby Age: {review.babyAge}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">&quot;{review.comment}&quot;</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
            <MessageSquare className="mr-2 h-4 w-4" /> Write Your Review (Coming Soon)
          </Button>
        </div>
      </section>

      <section className="py-8">
         <Card className="bg-gradient-to-r from-primary/80 to-secondary/80 text-primary-foreground p-6 rounded-lg shadow-glow-lg text-center">
            <CardTitle className="text-2xl font-headline mb-2">Secure &amp; Trusted Checkout</CardTitle>
            <CardDescription className="text-primary-foreground/80 mb-4">Your journey through the BabyVerse is protected by the latest in galactic security protocols.</CardDescription>
            <div className="flex justify-center items-center space-x-4">
                <Badge variant="secondary" className="bg-green-500/80 text-white"><ShieldCheck className="mr-1.5 h-4 w-4"/>SSL Secured</Badge>
                <Badge variant="secondary" className="bg-blue-500/80 text-white"><Info className="mr-1.5 h-4 w-4"/>Data Encrypted</Badge>
                <Badge variant="secondary" className="bg-purple-500/80 text-white"><ThumbsUp className="mr-1.5 h-4 w-4"/>Trusted by Parents</Badge>
            </div>
            <p className="text-xs mt-3 text-primary-foreground/70">Pay with Zizo_PayWave, Stripe, or PayPal (Conceptual)</p>
        </Card>
      </section>
    </div>
  );
}

export default function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(paramsPromise);
  const { id: productId } = resolvedParams;

  // Wrap the actual content component with Suspense for better loading UX if needed,
  // though the component itself handles its loading state.
  // This structure is mainly to correctly use the `use(paramsPromise)` hook.
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-20 w-20 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">Loading product...</p>
      </div>
    }>
      <ProductDetailPageContent productId={productId} />
    </Suspense>
  );
}

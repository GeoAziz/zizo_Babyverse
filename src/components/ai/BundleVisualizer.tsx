import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Loader2 } from "lucide-react";
import type { ProductBundlerOutput } from "@/ai/flows/product-bundler";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

interface BundleVisualizerProps {
  bundle: ProductBundlerOutput;
  onAddToCart: () => void;
  isLoading: boolean;
}

export function BundleVisualizer({ bundle, onAddToCart, isLoading }: BundleVisualizerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await Promise.all(
          bundle.productIds.map(id => 
            fetch(`/api/products/${id}`).then(res => res.json())
          )
        );
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching bundle products:', error);
      }
    };
    
    fetchProducts();
  }, [bundle.productIds]);

  const totalPrice = bundle.totalPrice;
  const savingsAmount = totalPrice * 0.1; // 10% bundle discount
  const finalPrice = totalPrice - savingsAmount;

  return (
    <Card className="bg-card/80 backdrop-blur-md shadow-glow-md border-accent/30">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <Package className="h-12 w-12 text-primary" />
        </div>        <CardTitle className="text-2xl font-headline text-center text-primary">
          Customized Baby Bundle
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          {bundle.bundleDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="bg-background/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
                </CardHeader>
                {product.imageUrl && (
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full rounded-md"
                    />
                  </div>
                )}
                <CardFooter className="p-4">
                  <p className="text-sm text-muted-foreground">
                    ${product.price.toFixed(2)}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex flex-col items-center space-y-4 p-6 bg-primary/5 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</p>
              {savingsAmount > 0 && (
                <>
                  <p className="text-sm text-muted-foreground mt-2">Bundle Savings</p>
                  <p className="text-lg font-semibold text-green-600">-${savingsAmount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-2">Final Price</p>
                  <p className="text-2xl font-bold text-primary">${finalPrice.toFixed(2)}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onAddToCart}
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding to Cart...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add Bundle to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
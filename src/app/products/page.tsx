'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Search, Filter, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/products', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          let detailedErrorMessage = `Failed to fetch products. Status: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              detailedErrorMessage = `API Error: ${errorData.message} (Status: ${response.status})`;
            }
          } catch (jsonError) {
            console.warn("Could not parse error response as JSON from /api/products.");
          }
          throw new Error(detailedErrorMessage);
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (e: any) {
        console.error("Error fetching products in ProductsPage:", e.message);
        setError(e.message);
        toast({
          title: "Error Loading Products",
          description: e.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const categories = useMemo(() => {
    if (products.length === 0) return ['all'];
    const allCategories = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(allCategories)];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    switch (sortOrder) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return filtered;
  }, [products, searchTerm, categoryFilter, sortOrder]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-lg shadow-glow-sm">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center">
          <ShoppingBag className="mr-3 h-10 w-10 text-accent" /> Explore Our Cosmic Collection
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Find everything your little star needs, from nebula-soft diapers to rocket-fast toys.
        </p>
      </section>

      <Card className="shadow-card-glow">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary flex items-center">
            <Filter className="mr-2 h-5 w-5 text-accent" /> Filter & Sort Your Universe
          </CardTitle>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setCurrentPage(1); }}>
              <SelectTrigger disabled={isLoading || error !== null}>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat ?? ''} value={cat ?? ''}>{cat === 'all' ? 'All Categories' : cat ?? ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value) => { setSortOrder(value); setCurrentPage(1); }}>
              <SelectTrigger disabled={isLoading || error !== null}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading products from the BabyVerse...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-xl text-destructive mb-2">Oops! A Cosmic Glitch Occurred</p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">Try Reloading Galaxy</Button>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No products found matching your criteria. Adjust your filters or explore all items!</p>
            </div>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-12 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(page)}
                  className="shadow-sm"
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

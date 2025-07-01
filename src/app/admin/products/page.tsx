
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Search, Bot, Sparkles, Loader2 } from 'lucide-react';
// import { mockProducts } from '@/lib/mockData'; // No longer used for initial load
import type { Product } from '@/lib/types';
import { generateProductDescription, type GenerateProductDescriptionInput } from '@/ai/flows/ai-product-descriptions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not load products.", variant: "destructive" });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    setCurrentProduct(product ? { ...product } : { name: '', category: '', price: 0, stock: 0, description: '', imageUrl: 'https://placehold.co/600x400.png', features: '', targetAudience: '', keywords: '', dataAiHint: 'product' });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentProduct) {
      const { name, value } = e.target;
      const val = (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) : value;
      setCurrentProduct({ ...currentProduct, [name]: val });
    }
  };
  
  const handleCheckboxChange = (name: keyof Product, checked: boolean | string ) => {
     if (currentProduct) {
      setCurrentProduct({ ...currentProduct, [name]: !!checked });
    }
  };


  const handleSaveProduct = async () => {
    if (!currentProduct) return;
    setIsSaving(true);

    const method = currentProduct.id ? 'PUT' : 'POST';
    const url = currentProduct.id ? `/api/products/${currentProduct.id}` : '/api/products';
    
    // Ensure price and stock are numbers
    const productData = {
      ...currentProduct,
      price: Number(currentProduct.price) || 0,
      stock: Number(currentProduct.stock) || 0,
      tags: typeof currentProduct.tags === 'string' ? (currentProduct.tags as string).split(',').map(t => t.trim()) : currentProduct.tags || [],
    };


    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${currentProduct.id ? 'update' : 'add'} product`);
      }
      
      const savedProduct = await response.json();
      
      if (currentProduct.id) {
        setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
        toast({ title: "Product Updated", description: `${savedProduct.name} has been updated.` });
      } else {
        setProducts([savedProduct, ...products]);
        toast({ title: "Product Added", description: `${savedProduct.name} has been added.` });
      }
      setIsModalOpen(false);
      setCurrentProduct(null);
    } catch (error: any) {
      toast({ title: "Save Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      setProducts(products.filter(p => p.id !== productId));
      toast({ title: "Product Deleted", description: `Product has been deleted.`, variant: "destructive" });
    } catch (error: any) {
       toast({ title: "Delete Error", description: error.message, variant: "destructive" });
    }
  };
  
  const handleGenerateAIDescription = async () => {
    if (!currentProduct || !currentProduct.name || !currentProduct.category || !currentProduct.features || !currentProduct.targetAudience || !currentProduct.keywords) {
      toast({ title: "Missing Information", description: "Please fill in Product Name, Category, Features, Target Audience, and Keywords to generate description.", variant: "destructive" });
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const input: GenerateProductDescriptionInput = {
        productName: currentProduct.name,
        productCategory: currentProduct.category,
        productFeatures: currentProduct.features as string,
        targetAudience: currentProduct.targetAudience as string,
        keywords: currentProduct.keywords as string,
      };
      const result = await generateProductDescription(input); // This is still a direct Genkit call
      setCurrentProduct(prev => ({ ...prev, description: result.productDescription }));
      toast({ title: "AI Description Generated!", description: "The product description has been updated." });
    } catch (error) {
      console.error("Error generating AI description:", error);
      toast({ title: "AI Error", description: "Could not generate description. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingDesc(false);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-bold text-primary">Product Management</h1>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
        </Button>
      </div>

      <Card className="shadow-card-glow">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Manage your baby products, update stock, prices, and descriptions.</CardDescription>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full md:w-1/3"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <p className="ml-2 text-muted-foreground">Loading products...</p>
             </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image src={product.imageUrl || 'https://placehold.co/50x50.png'} alt={product.name} width={40} height={40} className="rounded object-cover" data-ai-hint={product.dataAiHint || product.category.toLowerCase()} />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)} className="text-blue-500 hover:text-blue-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
           {!isLoadingProducts && filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No products found matching your search.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {currentProduct?.id ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleSaveProduct();}} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" value={currentProduct.name} onChange={handleInputChange} required/>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" value={currentProduct.category} onChange={handleInputChange} required/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" value={currentProduct.price} onChange={handleInputChange} required step="0.01"/>
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" name="stock" type="number" value={currentProduct.stock} onChange={handleInputChange} required step="1"/>
                </div>
              </div>
               <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={currentProduct.imageUrl} onChange={handleInputChange} required/>
                </div>
                <div>
                  <Label htmlFor="dataAiHint">Image AI Hint (1-2 words for placeholder search)</Label>
                  <Input id="dataAiHint" name="dataAiHint" value={currentProduct.dataAiHint || ''} onChange={handleInputChange} placeholder="e.g. baby toy"/>
                </div>
                <div className="items-top flex space-x-2 mt-2">
                    <Checkbox id="ecoTag" name="ecoTag" checked={!!currentProduct.ecoTag} onCheckedChange={(checked) => handleCheckboxChange('ecoTag', checked)} />
                    <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="ecoTag" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Eco-Friendly</Label>
                    <p className="text-xs text-muted-foreground">Mark if this product is eco-friendly.</p>
                    </div>
                </div>
                <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" name="tags" value={Array.isArray(currentProduct.tags) ? currentProduct.tags.join(', ') : currentProduct.tags || ''} onChange={handleInputChange} placeholder="e.g. Bestseller, Organic"/>
                </div>

              <hr className="my-4" />
              <h3 className="text-lg font-semibold text-primary flex items-center"><Bot className="mr-2 h-5 w-5 text-accent"/> AI Description Helper</h3>
              
              <div>
                <Label htmlFor="features">Features (for AI, e.g., Organic cotton, BPA-free)</Label>
                <Input id="features" name="features" value={currentProduct.features as string || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="targetAudience">Target Audience (for AI)</Label>
                <Input id="targetAudience" name="targetAudience" value={currentProduct.targetAudience as string || ''} onChange={handleInputChange} placeholder="e.g., Newborns, Toddlers 1-3 years"/>
              </div>
              <div>
                <Label htmlFor="keywords">Keywords (for AI, comma-separated)</Label>
                <Input id="keywords" name="keywords" value={currentProduct.keywords as string || ''} onChange={handleInputChange} placeholder="e.g., soft, safe, developmental"/>
              </div>
              
              <Button type="button" onClick={handleGenerateAIDescription} disabled={isGeneratingDesc} variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
                {isGeneratingDesc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate AI Description
              </Button>

              <div>
                <Label htmlFor="description">Product Description</Label>
                <Textarea id="description" name="description" value={currentProduct.description} onChange={handleInputChange} rows={5} required/>
              </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Save Product
              </Button>
            </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

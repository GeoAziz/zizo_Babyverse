
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Tag, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import type { Promotion as PrismaPromotion, PromoType } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox'; // Added import

// Interface matching Prisma model with Date as string for form handling
interface PromotionForm extends Omit<PrismaPromotion, 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'value'> {
  startDate: string;
  endDate: string;
  value: string; // Keep as string for form input
}


export default function PromoManagerPage() {
  const [promotions, setPromotions] = useState<PrismaPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<Partial<PromotionForm> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/promotions');
      if (!response.ok) throw new Error('Failed to fetch promotions');
      const data: PrismaPromotion[] = await response.json();
      setPromotions(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not load promotions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenModal = (promo?: PrismaPromotion) => {
    if (promo) {
      setCurrentPromo({
        ...promo,
        startDate: format(new Date(promo.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(promo.endDate), 'yyyy-MM-dd'),
        value: String(promo.value), // Convert number to string for input
        productIds: promo.productIds || [],
        categoryNames: promo.categoryNames || [],
      });
    } else {
      setCurrentPromo({ 
        code: '', 
        type: 'PERCENTAGE', 
        value: '0', 
        description: '', 
        startDate: format(new Date(), 'yyyy-MM-dd'), 
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), 
        isActive: true,
        productIds: [],
        categoryNames: [],
        appliesTo: 'ALL_PRODUCTS'
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentPromo) {
      const { name, value, type } = e.target;
      const val = type === 'number' ? value : value; // Keep value as string for form handling
      setCurrentPromo(prev => ({ ...prev, [name]: val }));
    }
  };
  
  const handleCheckboxChange = (name: keyof PromotionForm, checked: boolean | string) => {
     if (currentPromo) {
      setCurrentPromo(prev => ({ ...prev, [name]: !!checked }));
    }
  };

  const handleSelectChange = (name: keyof PromotionForm, value: string) => {
     if (currentPromo) {
      setCurrentPromo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSavePromo = async () => {
    if (!currentPromo || !currentPromo.code || !currentPromo.value || !currentPromo.description || !currentPromo.startDate || !currentPromo.endDate) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive"});
      return;
    }
    setIsSaving(true);

    const promoDataToSave = {
      ...currentPromo,
      value: parseFloat(currentPromo.value), // Convert back to number
      startDate: parseISO(currentPromo.startDate as string), // Convert to Date
      endDate: parseISO(currentPromo.endDate as string),     // Convert to Date
      productIds: typeof currentPromo.productIds === 'string' ? (currentPromo.productIds as string).split(',').map(t => t.trim()).filter(t => t) : currentPromo.productIds || [],
      categoryNames: typeof currentPromo.categoryNames === 'string' ? (currentPromo.categoryNames as string).split(',').map(t => t.trim()).filter(t => t) : currentPromo.categoryNames || [],
    };


    const method = currentPromo.id ? 'PUT' : 'POST';
    const url = currentPromo.id ? `/api/promotions/${currentPromo.id}` : '/api/promotions';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoDataToSave),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${currentPromo.id ? 'update' : 'add'} promotion`);
      }
      
      await fetchPromotions(); // Refetch all promotions
      toast({ title: `Promotion ${currentPromo.id ? 'Updated' : 'Created'}`, description: `Promo code ${currentPromo.code} has been saved.` });
      setIsModalOpen(false);
      setCurrentPromo(null);
    } catch (error: any) {
      toast({ title: "Save Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeletePromo = async (promoId: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      const response = await fetch(`/api/promotions/${promoId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete promotion');
      }
      await fetchPromotions(); // Refetch
      toast({ title: "Promotion Deleted", variant: "destructive" });
    } catch (error: any) {
       toast({ title: "Delete Error", description: error.message, variant: "destructive" });
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
          <Tag className="mr-3 h-8 w-8 text-primary" /> Promotions Manager
        </h1>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Promotion
        </Button>
      </div>

      <Card className="shadow-card-glow">
        <CardHeader>
          <CardTitle>Active & Upcoming Campaigns</CardTitle>
          <CardDescription>Manage discount codes, special offers, and galactic deals.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary"/>
              <p className="ml-2 text-muted-foreground">Loading promotions...</p>
            </div>
          ) : promotions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used/Limit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono text-primary font-semibold">{promo.code}</TableCell>
                    <TableCell>{promo.description}</TableCell>
                    <TableCell className="capitalize">{promo.type.replace('_', ' ')}</TableCell>
                    <TableCell>{promo.type === 'PERCENTAGE' ? `${promo.value}%` : `$${promo.value.toFixed(2)}`}</TableCell>
                    <TableCell>
                        {format(new Date(promo.startDate), 'PP')} - {format(new Date(promo.endDate), 'PP')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${promo.isActive && new Date(promo.endDate) >= new Date() ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                        {promo.isActive && new Date(promo.endDate) >= new Date() ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{promo.timesUsed} / {promo.usageLimit ?? '∞'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(promo)} className="text-blue-500 hover:text-blue-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePromo(promo.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-center text-muted-foreground py-8">No promotions created yet. Launch your first campaign!</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {currentPromo?.id ? 'Edit Promotion' : 'Create New Promotion'}
            </DialogTitle>
          </DialogHeader>
          {currentPromo && (
            <form onSubmit={(e: FormEvent) => {e.preventDefault(); handleSavePromo();}} className="space-y-4 py-4">
              <div>
                <Label htmlFor="code">Promo Code</Label>
                <Input id="code" name="code" value={currentPromo.code || ''} onChange={handleInputChange} placeholder="e.g., SUMMER20" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={currentPromo.description || ''} onChange={handleInputChange} placeholder="e.g., 20% off all summer items" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" value={currentPromo.type || 'PERCENTAGE'} onValueChange={(value) => handleSelectChange('type', value as PromoType)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" name="value" type="number" value={currentPromo.value || '0'} onChange={handleInputChange} placeholder={currentPromo.type === 'PERCENTAGE' ? "e.g., 20 for 20%" : "e.g., 10 for $10"} required step="0.01"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={currentPromo.startDate || ''} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" value={currentPromo.endDate || ''} onChange={handleInputChange} required />
                </div>
              </div>
               <div>
                <Label htmlFor="minSpend">Minimum Spend (Optional)</Label>
                <Input id="minSpend" name="minSpend" type="number" value={currentPromo.minSpend || ''} onChange={handleInputChange} placeholder="e.g., 50" step="0.01"/>
              </div>
               <div>
                  <Label htmlFor="appliesTo">Applies To</Label>
                  <Select name="appliesTo" value={currentPromo.appliesTo || 'ALL_PRODUCTS'} onValueChange={(value) => handleSelectChange('appliesTo', value)}>
                    <SelectTrigger id="appliesTo">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_PRODUCTS">All Products</SelectItem>
                      <SelectItem value="SPECIFIC_PRODUCTS">Specific Products</SelectItem>
                      <SelectItem value="SPECIFIC_CATEGORIES">Specific Categories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {currentPromo.appliesTo === 'SPECIFIC_PRODUCTS' && (
                  <div>
                    <Label htmlFor="productIds">Product IDs (comma-separated)</Label>
                    <Input id="productIds" name="productIds" value={Array.isArray(currentPromo.productIds) ? currentPromo.productIds.join(', ') : currentPromo.productIds || ''} onChange={handleInputChange} placeholder="e.g., prod_1,prod_abc" />
                  </div>
                )}
                {currentPromo.appliesTo === 'SPECIFIC_CATEGORIES' && (
                  <div>
                    <Label htmlFor="categoryNames">Category Names (comma-separated)</Label>
                    <Input id="categoryNames" name="categoryNames" value={Array.isArray(currentPromo.categoryNames) ? currentPromo.categoryNames.join(', ') : currentPromo.categoryNames || ''} onChange={handleInputChange} placeholder="e.g., Diapers,Toys" />
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                  <Input id="usageLimit" name="usageLimit" type="number" value={currentPromo.usageLimit || ''} onChange={handleInputChange} placeholder="e.g., 100" />
                </div>
                 <div className="flex items-center space-x-2 pt-6">
                    <Checkbox id="isActive" name="isActive" checked={!!currentPromo.isActive} onCheckedChange={(checked) => handleCheckboxChange('isActive', checked)} />
                    <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                </div>
              </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {currentPromo.id ? 'Save Changes' : 'Create Promotion'}
              </Button>
            </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

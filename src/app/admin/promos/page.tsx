'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Tag, Percent, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Promotion {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  timesUsed?: number;
  conditions?: string; // e.g., first-time buyers, bundle only
}

const mockPromotions: Promotion[] = [
  {
    id: 'promo_1',
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    description: '15% off for new customers',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    isActive: true,
    conditions: 'First-time buyers only',
    timesUsed: 25,
  },
  {
    id: 'promo_2',
    code: 'SAVE10NOW',
    type: 'fixed_amount',
    value: 10,
    description: '$10 off on orders over $100',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
    isActive: true,
    conditions: 'Minimum spend $100',
    timesUsed: 150,
    usageLimit: 500,
  },
];

export default function PromoManagerPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<Partial<Promotion> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPromotions(mockPromotions);
  }, []);

  const handleOpenModal = (promo?: Promotion) => {
    setCurrentPromo(promo ? { ...promo } : { 
      code: '', 
      type: 'percentage', 
      value: 0, 
      description: '', 
      startDate: new Date().toISOString().split('T')[0], 
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      isActive: true 
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentPromo) {
      const { name, value, type, checked } = e.target;
      const val = type === 'number' ? parseFloat(value) : type === 'checkbox' ? checked : value;
      setCurrentPromo({ ...currentPromo, [name]: val });
    }
  };
  
  const handleSelectChange = (name: keyof Promotion, value: string) => {
     if (currentPromo) {
      setCurrentPromo({ ...currentPromo, [name]: value });
    }
  }

  const handleSavePromo = () => {
    if (currentPromo) {
      if (!currentPromo.code || !currentPromo.value || !currentPromo.description || !currentPromo.startDate || !currentPromo.endDate) {
        toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive"});
        return;
      }
      if (currentPromo.id) { // Edit
        setPromotions(promotions.map(p => p.id === currentPromo!.id ? currentPromo as Promotion : p));
        toast({ title: "Promotion Updated", description: `Promo code ${currentPromo.code} updated.` });
      } else { // Add
        const newPromo = { ...currentPromo, id: `promo_${Date.now()}`, timesUsed: 0 } as Promotion;
        setPromotions([newPromo, ...promotions]);
        toast({ title: "Promotion Created", description: `New promo code ${newPromo.code} added.` });
      }
      setIsModalOpen(false);
      setCurrentPromo(null);
    }
  };
  
  const handleDeletePromo = (promoId: string) => {
    setPromotions(promotions.filter(p => p.id !== promoId));
    toast({ title: "Promotion Deleted", variant: "destructive" });
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
          <Tag className="mr-3 h-8 w-8 text-primary" /> Promo Manager
        </h1>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Promotion
        </Button>
      </div>

      <Card className="shadow-card-glow">
        <CardHeader>
          <CardTitle>Active & Upcoming Campaigns</CardTitle>
          <CardDescription>Manage discount codes, special offers, and loyalty programs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
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
                  <TableCell>{promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value.toFixed(2)}`}</TableCell>
                  <TableCell>{format(new Date(promo.startDate), 'PP')}</TableCell>
                  <TableCell>{format(new Date(promo.endDate), 'PP')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${promo.isActive && new Date(promo.endDate) >= new Date() ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                      {promo.isActive && new Date(promo.endDate) >= new Date() ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{promo.timesUsed ?? 0} / {promo.usageLimit ?? '∞'}</TableCell>
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
          {promotions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No promotions created yet.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {currentPromo?.id ? 'Edit Promotion' : 'Create New Promotion'}
            </DialogTitle>
          </DialogHeader>
          {currentPromo && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="code">Promo Code</Label>
                <Input id="code" name="code" value={currentPromo.code} onChange={handleInputChange} placeholder="e.g., SUMMER20" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={currentPromo.description} onChange={handleInputChange} placeholder="e.g., 20% off all summer items" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" value={currentPromo.type} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" name="value" type="number" value={currentPromo.value} onChange={handleInputChange} placeholder={currentPromo.type === 'percentage' ? "e.g., 20 for 20%" : "e.g., 10 for $10"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={currentPromo.startDate?.split('T')[0]} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" value={currentPromo.endDate?.split('T')[0]} onChange={handleInputChange} />
                </div>
              </div>
               <div>
                <Label htmlFor="conditions">Conditions (Optional)</Label>
                <Input id="conditions" name="conditions" value={currentPromo.conditions || ''} onChange={handleInputChange} placeholder="e.g., Minimum spend $50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                  <Input id="usageLimit" name="usageLimit" type="number" value={currentPromo.usageLimit || ''} onChange={handleInputChange} placeholder="e.g., 100" />
                </div>
                 <div className="flex items-center space-x-2 pt-6">
                    <Input type="checkbox" id="isActive" name="isActive" checked={!!currentPromo.isActive} onChange={handleInputChange} className="h-4 w-4"/>
                    <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSavePromo} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Promotion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

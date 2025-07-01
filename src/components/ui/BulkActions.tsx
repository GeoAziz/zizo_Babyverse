import { useState } from 'react';
import { Button } from './button';
import { PackageSearch, RefreshCcw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';

interface BulkActionsProps {
  selectedIds: string[];
  onComplete: () => void;
}

export function BulkActions({ selectedIds, onComplete }: BulkActionsProps) {
  const [processing, setProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [operation, setOperation] = useState<'update_prices' | 'update_stock' | 'delete'>('update_prices');
  const [value, setValue] = useState('');
  const { toast } = useToast();

  const handleProcess = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to process",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          productIds: selectedIds,
          data: operation === 'delete' ? undefined : {
            [operation === 'update_prices' ? 'price' : 'stock']: parseFloat(value)
          }
        }),
      });

      if (!response.ok) throw new Error('Bulk operation failed');

      const result = await response.json();
      
      toast({
        title: "Operation complete",
        description: `Successfully processed ${result.affectedItems} items`
      });
      
      setShowDialog(false);
      onComplete();
    } catch (error) {
      console.error('Bulk operation error:', error);
      toast({
        title: "Operation failed",
        description: "There was a problem processing the items",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setOperation('update_prices');
            setShowDialog(true);
          }}
          disabled={selectedIds.length === 0}
        >
          <PackageSearch className="mr-2 h-4 w-4" />
          Update Prices
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            setOperation('update_stock');
            setShowDialog(true);
          }}
          disabled={selectedIds.length === 0}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Update Stock
        </Button>
        
        <Button
          variant="destructive"
          onClick={() => {
            setOperation('delete');
            setShowDialog(true);
          }}
          disabled={selectedIds.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Items
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {operation === 'delete' ? 'Delete Items' : 
               operation === 'update_prices' ? 'Update Prices' : 'Update Stock'}
            </DialogTitle>
            <DialogDescription>
              This action will affect {selectedIds.length} selected items.
            </DialogDescription>
          </DialogHeader>

          {operation !== 'delete' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>New {operation === 'update_prices' ? 'Price' : 'Stock'}</label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={operation === 'update_prices' ? "Enter new price" : "Enter new stock"}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={operation === 'delete' ? "destructive" : "default"}
              onClick={handleProcess}
              disabled={processing || (operation !== 'delete' && !value)}
            >
              {processing ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
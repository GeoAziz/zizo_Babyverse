
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, Truck, Mail, Search, Filter, Edit, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AdminOrder } from '@/types/admin';
import { safeFormatDate } from '@/types/admin';

type OrderStatus = 'Pending' | 'Processing' | 'PodPacked' | 'Dispatched' | 'InTransit' | 'Delivered' | 'Cancelled';


export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the admin orders endpoint
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (e: any) {
      setError(e.message || 'Could not load orders.');
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredOrders = orders.filter(order =>
    (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ) &&
    (statusFilter === 'all' || order.status === statusFilter)
  );
  
  const orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'PodPacked', 'Dispatched', 'InTransit', 'Delivered', 'Cancelled'];

  const handleOpenModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (selectedOrder && newStatus && newStatus !== selectedOrder.status) {
      try {
        const response = await fetch(`/api/orders/${selectedOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update status');
        }
        const updatedOrderFromServer: AdminOrder = await response.json();
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o.id === updatedOrderFromServer.id ? updatedOrderFromServer : o
          )
        );
        toast({ title: "Order Status Updated", description: `Order ${selectedOrder.id} status changed to ${newStatus}.` });
        setIsModalOpen(false);
        setSelectedOrder(null);
      } catch (error: any) {
         toast({ title: "Error", description: error.message || "Could not update status.", variant: "destructive" });
      }
    } else {
      setIsModalOpen(false); // Close if no change
    }
  };


  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-700';
      case 'Processing': return 'bg-blue-500/20 text-blue-700';
      case 'PodPacked': return 'bg-indigo-500/20 text-indigo-700';
      case 'Dispatched': return 'bg-purple-500/20 text-purple-700';
      case 'InTransit': return 'bg-cyan-500/20 text-cyan-700';
      case 'Delivered': return 'bg-green-500/20 text-green-700';
      case 'Cancelled': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading interstellar orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary">Orders Management</h1>

      <Card className="shadow-card-glow">
        <CardHeader>
          <CardTitle>Customer Orders</CardTitle>
          <CardDescription>Monitor and manage all purchases made in BabyVerse.</CardDescription>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by Order ID, Customer ID, Name, Email..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {orderStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
             <div className="my-4 p-4 bg-destructive/10 text-destructive text-sm rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2"/> {error}
            </div>
          )}
          {!error && filteredOrders.length > 0 ? (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell className="font-mono text-primary hover:underline">
                        {/* Link to a more detailed admin order view if needed */}
                        {order.id.substring(0,12)}...
                    </TableCell>
                    <TableCell>
                        {order.user?.name || order.userId}
                        {order.user?.email && <div className="text-xs text-muted-foreground">{order.user.email}</div>}
                    </TableCell>
                    <TableCell>{safeFormatDate(order.createdAt, 'PPpp')}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                        </span>
                    </TableCell>
                    <TableCell>
                        <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(order)} className="text-blue-500 hover:text-blue-700">
                            <Edit className="h-4 w-4" />
                        </Button>
                        {/* Eye button could link to user-facing order detail or admin specific one */}
                        <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-700"> 
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-orange-500 hover:text-orange-700">
                            <Mail className="h-4 w-4" />
                        </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            ) : (
             !isLoading && !error && <p className="text-center text-muted-foreground py-8">No orders found matching your criteria.</p>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Update Order Status</DialogTitle>
            <CardDescription>Order ID: {selectedOrder?.id}</CardDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-4">
              <p>Current Status: <span className={`font-semibold ${getStatusColor(selectedOrder.status).split(' ')[1]}`}>{selectedOrder.status}</span></p>
              <div>
                <Label htmlFor="newStatus">New Status</Label>
                <Select value={newStatus || ''} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                  <SelectTrigger id="newStatus">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateStatus} className="bg-primary hover:bg-primary/90 text-primary-foreground">Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

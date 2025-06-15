'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, Truck, Mail, Search, Filter, Edit } from 'lucide-react';
import { mockOrders } from '@/lib/mockData';
import type { Order } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status'] | ''>('');

  const { toast } = useToast();

  useEffect(() => {
    setOrders(mockOrders); // Load mock data
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredOrders = orders.filter(order =>
    (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.userId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || order.status === statusFilter)
  );
  
  const orderStatuses: Order['status'][] = ['Pending', 'Processing', 'Pod Packed', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'];

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus) {
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === selectedOrder.id ? { ...o, status: newStatus as Order['status'] } : o
        )
      );
      toast({ title: "Order Status Updated", description: `Order ${selectedOrder.id} status changed to ${newStatus}.` });
      setIsModalOpen(false);
      setSelectedOrder(null);
    }
  };


  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-700';
      case 'Processing': return 'bg-blue-500/20 text-blue-700';
      case 'Pod Packed': return 'bg-indigo-500/20 text-indigo-700';
      case 'Dispatched': return 'bg-purple-500/20 text-purple-700';
      case 'In Transit': return 'bg-cyan-500/20 text-cyan-700';
      case 'Delivered': return 'bg-green-500/20 text-green-700';
      case 'Cancelled': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

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
                placeholder="Search by Order ID or Customer ID..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-primary">{order.id}</TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell>{format(new Date(order.orderDate), 'PPpp')}</TableCell>
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
                       <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-700"> {/* Placeholder for view details */}
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-orange-500 hover:text-orange-700">
                        <Mail className="h-4 w-4" /> {/* Placeholder for contact buyer */}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No orders found matching your criteria.</p>
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
                <Select value={newStatus || ''} onValueChange={(value) => setNewStatus(value as Order['status'])}>
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

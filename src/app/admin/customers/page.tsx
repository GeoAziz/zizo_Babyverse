// This page is for direct customer management (listing, viewing profiles).
// For analytics and insights, a separate /admin/analytics page would be more appropriate.
// The original proposal mentioned "Customer Insights Page" for analytics.
// Let's make this page a Customer Management list, and create an analytics page later if needed.

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, Mail, Search, Users } from 'lucide-react';
import { mockOrders } from '@/lib/mockData'; // Using orders to derive mock users
import type { User } from '@/lib/types'; // Assuming User type exists
import { format } from 'date-fns';
import { CustomerAnalytics } from '@/components/admin/CustomerAnalytics';
import { PageHeader } from '@/components/admin/PageHeader';

interface MockCustomer {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  lastOrderDate: string;
  totalSpent: number;
  orderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<MockCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Create mock customers from orders
    const customerData: { [key: string]: MockCustomer } = {};
    mockOrders.forEach(order => {
      if (!customerData[order.userId]) {
        customerData[order.userId] = {          id: order.userId,
          name: `Customer ${order.userId.split('_')[1]}`, // e.g. Customer 1
          email: `customer${order.userId.split('_')[1]}@babyverse.com`,
          role: 'PARENT',
          image: null,
          lastOrderDate: order.createdAt.toISOString(),
          totalSpent: order.totalAmount,
          orderCount: 1,
          createdAt: order.createdAt,
          updatedAt: new Date(),
        };
      } else {
        customerData[order.userId].totalSpent += order.totalAmount;
        customerData[order.userId].orderCount += 1;
        if (order.createdAt > new Date(customerData[order.userId].lastOrderDate)) {
          customerData[order.userId].lastOrderDate = order.createdAt.toISOString();
        }
      }
    });
    setCustomers(Object.values(customerData));
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Customer Management"
        description="View and manage customer information"
      />
      <CustomerAnalytics />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" /> Customer Management
          </h1>
          {/* Button to add customer can be added if needed */}
        </div>

        <Card className="shadow-card-glow">
          <CardHeader>
            <CardTitle>Registered Parents</CardTitle>
            <CardDescription>View and manage customer profiles and their order history.</CardDescription>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers by name, email, or ID..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full md:w-1/3"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-primary">{customer.id}</TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="text-center">{customer.orderCount}</TableCell>
                    <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(customer.lastOrderDate), 'PP')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-700">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {filteredCustomers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No customers found matching your search.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

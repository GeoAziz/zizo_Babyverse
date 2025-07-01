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
import { Eye, Mail, Search, Users, User2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { CustomerAnalytics } from '@/components/admin/CustomerAnalytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { safeFormatDate, safeToISOString } from '@/types/admin';

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
  lastLoginDate?: string;
  status: 'active' | 'inactive';
  preferredCategories: string[];
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<MockCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'spent'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real customer data from API
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to fetch customers');
        
        const data = await response.json();
        if (data.success) {
          // Convert API data to MockCustomer format
          const customerData = data.users.map((user: any) => ({
            id: user.id,
            name: user.name || `Customer ${user.id.slice(-8)}`,
            email: user.email,
            role: user.role || 'PARENT',
            image: user.image || null,
            lastOrderDate: safeToISOString(user.lastOrderDate),
            totalSpent: user.totalSpent || 0,
            orderCount: user.totalOrders || 0,
            createdAt: new Date(user.createdAt || new Date()),
            updatedAt: new Date(user.updatedAt || new Date()),
            lastLoginDate: user.lastLoginDate,
            status: user.status || 'active',
            preferredCategories: user.preferredCategories || [],
          }));
          setCustomers(customerData);
        } else {
          throw new Error(data.message || 'Failed to fetch customers');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
        console.error('Error loading customers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(customer => {
    if (filterStatus === 'active') return customer.status === 'active';
    if (filterStatus === 'inactive') return customer.status === 'inactive';
    return true;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
    } else {
      return b.totalSpent - a.totalSpent;
    }
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Customer Management"
        description="View and manage customer data and relationships"
      />
      <CustomerAnalytics />
      <div className="space-y-8">
        {/* Enhanced filtering and sorting controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
              <Users className="mr-3 h-8 w-8 text-primary" /> Customer Management
            </h1>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="spent">Highest Spent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="shadow-card-glow">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Customer List</CardTitle>
              <CardDescription>View and manage your customer base</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <div className="h-12 bg-muted/20 animate-pulse rounded-md"/>
                  <div className="h-12 bg-muted/20 animate-pulse rounded-md"/>
                  <div className="h-12 bg-muted/20 animate-pulse rounded-md"/>
                </div>
              ) : error ? (
                <div className="text-center p-6">
                  <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4"/>
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                <User2 className="h-4 w-4 text-accent"/>
                              </div>
                              <span className="font-medium">{customer.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.lastOrderDate ? safeFormatDate(customer.lastOrderDate, 'MMM d, yyyy') : 'No orders'}</TableCell>
                          <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1"/>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

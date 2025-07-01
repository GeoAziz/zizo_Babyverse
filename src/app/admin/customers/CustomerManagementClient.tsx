'use client';

import { CustomerAnalytics } from '@/components/admin/CustomerAnalytics';
import { PageHeader } from '@/components/admin/PageHeader';

export default function CustomerManagementClient() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Customer Management"
        description="View and manage customer data and relationships"
      />
      <CustomerAnalytics />
    </div>
  );
}
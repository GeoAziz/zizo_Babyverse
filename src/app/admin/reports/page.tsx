'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, ChartBar } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('7d');

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`/api/reports/${reportType}?range=${dateRange}`);
      if (!response.ok) throw new Error('Failed to generate report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${dateRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
        <ChartBar className="mr-3 h-8 w-8"/> Reports & Analytics
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="customers">Customer Activity</SelectItem>
                  <SelectItem value="promos">Promotions Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerateReport} className="w-full">
            <FileDown className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>
    </div>
    );
  }
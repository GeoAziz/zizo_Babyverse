import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authOptions } from "@/lib/auth";
import { subDays, subMonths, subYears } from 'date-fns';

export async function GET(request: Request, { params }: { params: { type: string }}) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '7d';
  
  let startDate = new Date();
  switch (range) {
    case '30d': startDate = subDays(new Date(), 30); break;
    case '90d': startDate = subMonths(new Date(), 3); break;
    case '1y': startDate = subYears(new Date(), 1); break;
    default: startDate = subDays(new Date(), 7);
  }

  try {
    let data: any[];
    switch (params.type) {
      case 'sales':
        // Implement your own DB logic here to fetch sales data
        data = []; // Placeholder
        break;
      case 'inventory':
        // Implement your own DB logic here to fetch inventory data
        data = []; // Placeholder
        break;
      case 'customers':
        // Implement your own DB logic here to fetch customers data
        data = []; // Placeholder
        break;
      case 'promos':
        // Implement your own DB logic here to fetch promos data
        data = []; // Placeholder
        break;
      default:
        return NextResponse.json({ message: "Invalid report type" }, { status: 400 });
    }

    // Convert data to CSV
    const csvData = convertToCSV(data);
    
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${params.type}-report-${range}.csv"`
      }
    });
  } catch (error) {
    console.error(`Error generating ${params.type} report:`, error);
    return NextResponse.json({ message: "Failed to generate report" }, { status: 500 });
  }
}

function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}
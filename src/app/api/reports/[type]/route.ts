import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { subDays, subMonths, subYears } from 'date-fns';

export async function GET(request: Request, { params }: { params: { type: string }}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
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
    let data;
    switch (params.type) {
      case 'sales':
        data = await prisma.order.findMany({
          where: { createdAt: { gte: startDate } },
          include: { items: true, user: true },
          orderBy: { createdAt: 'desc' }
        });
        break;
      case 'inventory':
        data = await prisma.product.findMany({
          select: {
            id: true,
            name: true,
            stock: true,
            price: true,
            category: true
          }
        });
        break;
      case 'customers':
        data = await prisma.user.findMany({
          where: { orders: { some: { createdAt: { gte: startDate } } } },
          include: { orders: true },
          orderBy: { createdAt: 'desc' }
        });
        break;
      case 'promos':
        data = await prisma.promotion.findMany({
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: 'desc' }
        });
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
import { prisma } from '@/lib/db';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { EmailService } from './EmailService';
import { AnalyticsService } from './AnalyticsService';

export class ReportingService {
  static async generateMonthlyReport() {
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    const monthYear = format(startDate, 'MMMM yyyy');

    try {
      const [
        orderStats,
        topProducts,
        customerStats,
        inventoryStats
      ] = await Promise.all([
        // Order Statistics
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: true,
          _sum: {
            totalAmount: true
          },
          _avg: {
            totalAmount: true
          }
        }),

        // Top Selling Products
        prisma.orderItem.groupBy({
          by: ['productId', 'name'],
          where: {
            order: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          },
          _sum: {
            quantity: true
          },
          orderBy: {
            _sum: {
              quantity: 'desc'
            }
          },
          take: 10
        }),

        // Customer Statistics
        prisma.user.aggregate({
          where: {
            role: 'PARENT',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: true
        }),

        // Inventory Status
        prisma.product.groupBy({
          by: ['category'],
          _count: true,
          _sum: {
            stock: true
          }
        })
      ]);

      const report = {
        period: monthYear,
        orders: {
          total: orderStats._count,
          revenue: orderStats._sum.totalAmount,
          averageOrderValue: orderStats._avg.totalAmount
        },
        products: {
          topSellers: topProducts.map(p => ({
            name: p.name,
            quantity: p._sum.quantity
          }))
        },
        customers: {
          newCustomers: customerStats._count
        },
        inventory: {
          byCategory: inventoryStats.map(cat => ({
            category: cat.category,
            items: cat._count,
            totalStock: cat._sum.stock
          }))
        }
      };      // Send report via email
      await EmailService.sendReport(
        'admin@babyverse.com',
        'MONTHLY_REPORT',
        report
      );

      return report;
    } catch (error) {
      console.error('Failed to generate monthly report:', error);
      throw new Error('Failed to generate monthly report');
    }
  }

  static async generateLowStockReport() {
    try {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: {
            lte: 10
          }
        },
        select: {
          id: true,
          name: true,
          stock: true,
          category: true
        },
        orderBy: {
          stock: 'asc'
        }
      });      if (lowStockProducts.length > 0) {
        await EmailService.sendReport(
          'admin@babyverse.com',
          'LOW_STOCK_REPORT',
          { products: lowStockProducts }
        );
      }

      return lowStockProducts;
    } catch (error) {
      console.error('Failed to generate low stock report:', error);
      throw new Error('Failed to generate low stock report');
    }
  }

  static async scheduleDailyReports() {
    try {
      const metrics = await AnalyticsService.getDashboardMetrics();      await EmailService.sendReport(
        'admin@babyverse.com',
        'DAILY_REPORT',
        metrics
      );
      return metrics;
    } catch (error) {
      console.error('Failed to generate daily report:', error);
      throw new Error('Failed to generate daily report');
    }
  }
}
import { prisma } from '@/lib/db';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export class AnalyticsService {
  static async getDashboardMetrics() {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);

    try {
      const [
        dailyOrders,
        monthlyOrders,
        dailyRevenue,
        monthlyRevenue,
        totalCustomers,
        lowStockProducts
      ] = await Promise.all([
        // Daily Orders
        prisma.order.count({
          where: {
            createdAt: {
              gte: startOfToday,
              lte: endOfToday
            }
          }
        }),
        // Monthly Orders
        prisma.order.count({
          where: {
            createdAt: {
              gte: startOfCurrentMonth,
              lte: endOfCurrentMonth
            }
          }
        }),
        // Daily Revenue
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: startOfToday,
              lte: endOfToday
            }
          },
          _sum: {
            totalAmount: true
          }
        }),
        // Monthly Revenue
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: startOfCurrentMonth,
              lte: endOfCurrentMonth
            }
          },
          _sum: {
            totalAmount: true
          }
        }),
        // Total Customers
        prisma.user.count({
          where: {
            role: 'PARENT'
          }
        }),
        // Low Stock Products
        prisma.product.findMany({
          where: {
            stock: {
              lte: 10
            }
          },
          select: {
            id: true,
            name: true,
            stock: true
          }
        })
      ]);

      return {
        daily: {
          orders: dailyOrders,
          revenue: dailyRevenue._sum.totalAmount || 0
        },
        monthly: {
          orders: monthlyOrders,
          revenue: monthlyRevenue._sum.totalAmount || 0
        },
        customers: totalCustomers,
        inventory: {
          lowStock: lowStockProducts
        }
      };
    } catch (error) {
      console.error('Failed to fetch analytics metrics:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  static async getRevenueChart(months: number = 6) {
    try {
      const startDate = subMonths(new Date(), months);
      
      const monthlyData = await prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          totalAmount: true
        },
        _count: true
      });

      return monthlyData.map(data => ({
        month: data.createdAt.toLocaleString('default', { month: 'short' }),
        revenue: data._sum.totalAmount || 0,
        orders: data._count
      }));
    } catch (error) {
      console.error('Failed to fetch revenue chart data:', error);
      throw new Error('Failed to fetch revenue chart data');
    }
  }

  static async getCustomerMetrics() {
    try {
      const [newCustomers, repeatCustomers] = await Promise.all([
        // New customers this month
        prisma.user.count({
          where: {
            role: 'PARENT',
            createdAt: {
              gte: startOfMonth(new Date())
            }
          }
        }),
        // Customers with more than one order
        prisma.order.groupBy({
          by: ['userId'],
          having: {
            userId: {
              _count: {
                gt: 1
              }
            }
          }
        })
      ]);

      return {
        newCustomers,
        repeatCustomers: repeatCustomers.length
      };
    } catch (error) {
      console.error('Failed to fetch customer metrics:', error);
      throw new Error('Failed to fetch customer metrics');
    }
  }
}
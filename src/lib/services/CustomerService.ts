import { prisma } from '@/lib/db';
import { EmailService } from './EmailService';
import type { Prisma } from '@prisma/client';

export class CustomerService {
  static async getCustomerProfile(userId: string) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: {
            include: {
              items: true
            }
          },
          babies: true,
          wishlists: true
        }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    } catch (error) {
      console.error('Failed to fetch customer profile:', error);
      throw new Error('Failed to fetch customer profile');
    }
  }

  static async getCustomerOrders(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return orders;
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      throw new Error('Failed to fetch customer orders');
    }
  }

  static async updateCustomerProfile(userId: string, data: Prisma.UserUpdateInput) {
    try {
      const updatedCustomer = await prisma.user.update({
        where: { id: userId },
        data
      });

      return updatedCustomer;
    } catch (error) {
      console.error('Failed to update customer profile:', error);
      throw new Error('Failed to update customer profile');
    }
  }

  static async addBabyProfile(userId: string, babyData: Prisma.BabyCreateInput) {
    try {
      const baby = await prisma.baby.create({
        data: {
          ...babyData,
          user: {
            connect: { id: userId }
          }
        }
      });

      return baby;
    } catch (error) {
      console.error('Failed to add baby profile:', error);
      throw new Error('Failed to add baby profile');
    }
  }

  static async getCustomerAnalytics(userId: string) {
    try {
      const [orderStats, favoriteCategories] = await Promise.all([
        // Order statistics
        prisma.order.aggregate({
          where: { userId },
          _count: true,
          _sum: {
            totalAmount: true
          },
          _avg: {
            totalAmount: true
          }
        }),

        // Favorite categories based on order history
        prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
            order: {
              userId
            }
          },
          _count: true,
          orderBy: {
            _count: {
              id: 'desc'
            }
          },
          take: 5
        })
      ]);

      return {
        totalOrders: orderStats._count,
        totalSpent: orderStats._sum.totalAmount,
        averageOrderValue: orderStats._avg.totalAmount,
        favoriteCategories
      };
    } catch (error) {
      console.error('Failed to fetch customer analytics:', error);
      throw new Error('Failed to fetch customer analytics');
    }
  }

  static async generatePersonalizedRecommendations(userId: string) {
    try {
      // Get customer's order history
      const orderHistory = await prisma.orderItem.findMany({
        where: {
          order: {
            userId
          }
        },
        include: {
          product: true
        }
      });

      // Get categories they've purchased from
      const categories = new Set(orderHistory.map(item => item.product.category));

      // Find similar products in those categories
      const recommendations = await prisma.product.findMany({
        where: {
          category: {
            in: Array.from(categories)
          },
          id: {
            notIn: orderHistory.map(item => item.productId)
          }
        },
        take: 10
      });

      return recommendations;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }
}
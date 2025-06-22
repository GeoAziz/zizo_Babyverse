import { prisma } from '@/lib/db';
import { EmailService } from './EmailService';
import type { Prisma, Product, User, Order, Baby } from '@prisma/client';

interface EnhancedRecommendation extends Product {
  reviews: Array<{ rating: number }>;
  recommendation?: { score: number };
}

export class CustomerService {
  static async getCustomerProfile(userId: string): Promise<User & { orders: Order[]; babies: Baby[]; wishlist: any[] }> {
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
          wishlist: true
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

  static async generateEnhancedRecommendations(userId: string, babyAge?: number): Promise<EnhancedRecommendation[]> {
    try {
      const [orderHistory, preferences, viewHistory] = await Promise.all([
        prisma.$queryRaw<Array<{ product: Product }>>`
          SELECT * FROM "OrderItem"
          JOIN "Product" ON "OrderItem"."productId" = "Product"."id"
          WHERE "OrderItem"."orderId" IN (
            SELECT "id" FROM "Order" WHERE "userId" = ${userId}
          )
        `,
        prisma.$queryRaw<Array<{ preferredCategories: string[]; preferAR: boolean }>>`
          SELECT * FROM "UserPreference" WHERE "userId" = ${userId}
        `,
        prisma.$queryRaw<Array<{ productId: string }>>`
          SELECT * FROM "ProductView"
          WHERE "userId" = ${userId}
          ORDER BY "viewedAt" DESC
          LIMIT 10
        `
      ]);

      const categories = new Set([
        ...orderHistory.map(item => item.product.category),
        ...(preferences?.[0]?.preferredCategories || [])
      ]);

      const recommendations = await prisma.product.findMany({
        where: {
          OR: [
            { category: { in: Array.from(categories) } },
            { id: { in: viewHistory.map(v => v.productId) } },
            babyAge ? {
              ageGroup: {
                contains: `${Math.floor(babyAge / 12)}Y`
              }
            } : {}
          ],
          id: { notIn: orderHistory.map(item => item.product.id) }
        },
        include: {
          Review: true,
          ProductRecommendation: true
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        take: 10
      }) as unknown as EnhancedRecommendation[];

      return recommendations;
    } catch (error) {
      console.error('Failed to generate enhanced recommendations:', error);
      throw new Error('Failed to generate enhanced recommendations');
    }
  }

  static async updateUserPreferences(userId: string, preferences: {
    preferredCategories?: string[];
    preferAR?: boolean;
    priceRange?: { min: number; max: number };
    notifications?: boolean;
  }) {
    try {
      return await prisma.$executeRaw`
        INSERT INTO "UserPreference" ("userId", "preferredCategories", "preferAR", "priceRange", "notifications")
        VALUES (${userId}, ${preferences.preferredCategories}, ${preferences.preferAR}, ${preferences.priceRange}, ${preferences.notifications})
        ON CONFLICT ("userId") DO UPDATE
        SET
          "preferredCategories" = EXCLUDED."preferredCategories",
          "preferAR" = EXCLUDED."preferAR",
          "priceRange" = EXCLUDED."priceRange",
          "notifications" = EXCLUDED."notifications"
      `;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }

  static async trackProductInteraction(
    userId: string,
    productId: string,
    interaction: {
      type: 'view' | 'purchase' | 'wishlist';
      duration?: number;
      rating?: number;
      feedback?: string;
    }
  ) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "ProductInteraction" ("userId", "productId", "type", "duration", "rating", "feedback")
        VALUES (${userId}, ${productId}, ${interaction.type}, ${interaction.duration}, ${interaction.rating}, ${interaction.feedback})
      `;
    } catch (error) {
      console.error('Failed to track product interaction:', error);
      throw new Error('Failed to track product interaction');
    }
  }
}
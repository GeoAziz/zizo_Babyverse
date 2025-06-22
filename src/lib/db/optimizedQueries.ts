import { prisma } from '@/lib/db';
import { MonitoringService } from '../monitoring';

export const OptimizedQueries = {
  async getProductWithRelations(productId: string) {
    const endTimer = MonitoringService.startPerformanceTimer('getProductWithRelations');
    try {
      return await prisma.product.findUnique({
        where: { id: productId },
        include: {
          reviews: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          category: true,
        }
      });
    } finally {
      endTimer();
    }
  },

  async getProductsByCategory(category: string, page = 1, limit = 20) {
    const endTimer = MonitoringService.startPerformanceTimer('getProductsByCategory');
    try {
      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { category },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            description: true,
            stock: true,
            averageRating: true,
          }
        }),
        prisma.product.count({ where: { category } })
      ]);

      return {
        products,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
          limit
        }
      };
    } finally {
      endTimer();
    }
  },

  async searchProducts(query: string, filters: Record<string, any> = {}) {
    const endTimer = MonitoringService.startPerformanceTimer('searchProducts');
    try {
      return await prisma.product.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { keywords: { contains: query, mode: 'insensitive' } }
              ]
            },
            { ...filters }
          ]
        },
        take: 20,
        orderBy: [
          { averageRating: 'desc' },
          { stock: 'desc' }
        ]
      });
    } finally {
      endTimer();
    }
  },

  async getLatestProducts(limit = 10) {
    const endTimer = MonitoringService.startPerformanceTimer('getLatestProducts');
    try {
      return await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stock: true,
          averageRating: true
        }
      });
    } finally {
      endTimer();
    }
  }
};
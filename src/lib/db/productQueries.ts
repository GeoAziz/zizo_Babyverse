import { prisma } from '@/lib/db';
import { trackPerformance } from '@/lib/monitoring';
import { AICache } from '@/lib/cache/aiCache';
import type { Prisma } from '@prisma/client';

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'price' | 'popularity' | 'newest';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

export const optimizedProductQueries = {
  async getProducts(options: ProductQueryOptions = {}) {
    const {
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
      category,
      search,
      sortBy = 'popularity',
      minPrice,
      maxPrice,
      inStock,
    } = options;

    const startTime = performance.now();

    try {
      // Build where clause
      const where: Prisma.ProductWhereInput = {
        AND: [
          // Category filter
          category ? { categoryId: category } : {},
          // Price range filter
          {
            price: {
              gte: minPrice,
              lte: maxPrice,
            },
          },
          // Stock filter
          inStock ? { stockQuantity: { gt: 0 } } : {},
          // Search filter
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { tags: { hasSome: search.split(' ') } },
            ],
          } : {},
        ],
      };

      // Build order by clause
      const orderBy: Prisma.ProductOrderByWithRelationInput = {
        ...(sortBy === 'price' && { price: 'asc' }),
        ...(sortBy === 'popularity' && { viewCount: 'desc' }),
        ...(sortBy === 'newest' && { createdAt: 'desc' }),
      };

      // Execute query with pagination
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            category: true,
            images: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      // Calculate average ratings
      const productsWithRatings = products.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
          : null,
      }));

      const duration = performance.now() - startTime;
      trackPerformance('product_query', duration, {
        resultCount: products.length,
        total,
        ...options,
      });

      return {
        products: productsWithRatings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      trackPerformance('product_query_error', duration, {
        error: error instanceof Error ? error.message : 'Unknown error',
        ...options,
      });
      throw error;
    }
  },

  async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
  },

  async getRelatedProducts(productId: string, limit = 4) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, tags: true },
    });

    if (!product) return [];

    return prisma.product.findMany({
      where: {
        OR: [
          { categoryId: product.categoryId },
          { tags: { hasSome: product.tags } },
        ],
        NOT: { id: productId },
      },
      take: limit,
      include: {
        images: true,
        reviews: {
          select: { rating: true },
        },
      },
    });
  },

  async getTopProducts(limit = 10) {
    return prisma.product.findMany({
      where: {
        stockQuantity: { gt: 0 },
      },
      orderBy: [
        { viewCount: 'desc' },
        { soldCount: 'desc' },
      ],
      take: limit,
      include: {
        images: true,
        reviews: {
          select: { rating: true },
        },
      },
    });
  },
};
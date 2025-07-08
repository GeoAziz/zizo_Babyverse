import { db } from '@/lib/firebaseAdmin';
import { MonitoringService } from '../monitoring';

export const OptimizedQueries = {
  async getProductWithRelations(productId: string) {
    const endTimer = MonitoringService.startPerformanceTimer('getProductWithRelations');
    try {
      const productDoc = await db.collection('products').doc(productId).get();
      const product = productDoc.data();
      // Fetch reviews and category if needed
      const reviewsSnap = await db.collection('reviews').where('productId', '==', productId).limit(5).get();
      const reviews = reviewsSnap.docs.map((doc: any) => doc.data());
      // ...fetch category if needed
      return { ...product, reviews };
    } finally {
      endTimer();
    }
  },

  async getProductsByCategory(category: string, page = 1, limit = 20) {
    const endTimer = MonitoringService.startPerformanceTimer('getProductsByCategory');
    try {
      const productsSnap = await db.collection('products')
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .offset((page - 1) * limit)
        .limit(limit)
        .get();

      const products = productsSnap.docs.map((doc: any) => doc.data());

      const totalSnap = await db.collection('products').where('category', '==', category).get();
      const total = totalSnap.size;

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
      const productsSnap = await db.collection('products')
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .get();

      return productsSnap.docs.map((doc: any) => doc.data());
    } finally {
      endTimer();
    }
  },

  async getLatestProducts(limit = 10) {
    const endTimer = MonitoringService.startPerformanceTimer('getLatestProducts');
    try {
      const productsSnap = await db.collection('products')
        .where('stock', '>', 0)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return productsSnap.docs.map((doc: any) => doc.data());
    } finally {
      endTimer();
    }
  }
};
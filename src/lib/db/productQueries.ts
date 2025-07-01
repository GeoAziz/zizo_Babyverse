import { getFirestore } from 'firebase-admin/firestore';
import admin from '../firebaseAdmin'; // Use centralized Firebase Admin

const db = getFirestore();

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

    let query = db.collection('products') as FirebaseFirestore.Query;
    if (category) query = query.where('category', '==', category);
    if (minPrice) query = query.where('price', '>=', minPrice);
    if (maxPrice) query = query.where('price', '<=', maxPrice);
    if (inStock) query = query.where('stock', '>', 0);
    // Add more filters as needed
    const snapshot = await query.limit(limit).get();
    return snapshot.docs.map(doc => doc.data());
  },
};
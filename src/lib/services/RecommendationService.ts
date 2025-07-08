import { db, auth } from '@/lib/firebaseAdmin';
const db = admin.firestore();
import { AICache } from '@/lib/cache/aiCache';
import type { Product, Baby, User, Order } from '@prisma/client';

interface RecommendationContext {
  babyProfile?: Baby;
  userPreferences?: any;
  orderHistory?: Order[];
  seasonality?: boolean;
  budget?: number;
}

interface ScoredProduct extends Product {
  score: number;
  reasons: string[];
}

export class RecommendationService {
  private static cache = AICache.getInstance();

  static async getContextualRecommendations(
    userId: string,
    context: RecommendationContext
  ): Promise<ScoredProduct[]> {
    const cacheKey = `recommendations:${userId}:${JSON.stringify(context)}`;
    const cached = await this.cache.get<ScoredProduct[]>(cacheKey);
    
    if (cached) return cached;

    const recommendations = await this.generateRecommendations(userId, context);
    await this.cache.set(cacheKey, recommendations, 3600); // Cache for 1 hour
    
    return recommendations;
  }

  private static async generateRecommendations(
    userId: string,
    context: RecommendationContext
  ): Promise<ScoredProduct[]> {
    // Get all available products
    const products = await db.collection('products').where('stock', '>', 0).get().then(snapshot => {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    });

    // Score each product based on context
    const scoredProducts = products.map((product: Product) => {
      const score = this.calculateContextualScore(product, context);
      return {
        ...product,
        score: score.total,
        reasons: score.reasons
      };
    });

    // Sort by score and return top recommendations
    return scoredProducts
      .sort((a: ScoredProduct, b: ScoredProduct) => b.score - a.score)
      .slice(0, 10);
  }
  private static calculateContextualScore(
    product: Product,
    context: RecommendationContext
  ): { total: number; reasons: string[] } {
    const scores: Record<string, number> = {};
    const reasons: string[] = [];

    // Age appropriateness (0-30 points)
    if (context.babyProfile) {
      const ageScore = this.calculateAgeScore(product, context.babyProfile.ageInMonths);
      scores.age = ageScore;
      if (ageScore > 20) reasons.push('Perfect for baby\'s age');
    }

    // User preferences match (0-25 points)
    if (context.userPreferences) {
      const prefScore = this.calculatePreferenceScore(product, context.userPreferences);
      scores.preferences = prefScore;
      if (prefScore > 15) reasons.push('Matches your preferences');
    }

    // Past purchase patterns (0-20 points)
    if (context.orderHistory) {
      const historyScore = this.calculateHistoryScore(product, context.orderHistory);
      scores.history = historyScore;
      if (historyScore > 15) reasons.push('Based on your shopping history');
    }

    // Seasonality (0-15 points)
    if (context.seasonality) {
      const seasonScore = this.calculateSeasonalityScore(product);
      scores.seasonal = seasonScore;
      if (seasonScore > 10) reasons.push('Perfect for the current season');
    }

    // Review score (0-10 points)
    const reviewScore = this.calculateReviewScore(product);
    scores.reviews = reviewScore;
    if (reviewScore > 8) reasons.push('Highly rated by other parents');

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      total: Math.min(100, total), // Normalize to max 100
      reasons
    };
  }

  private static calculateAgeScore(product: Product, ageInMonths: number): number {
    const ageInYears = Math.floor(ageInMonths / 12);
    const ageGroup = product.ageGroup?.toLowerCase() || '';

    if (ageGroup === 'all ages') return 25;
    if (ageGroup.includes(`${ageInYears}y`)) return 30;
    if (ageGroup.includes(`${ageInMonths}m`)) return 30;
    
    return 0;
  }

  private static calculatePreferenceScore(product: Product, preferences: any): number {
    let score = 0;
    
    if (preferences.preferredCategories?.includes(product.category)) {
      score += 15;
    }

    if (preferences.preferAR && product.arModelUrl) {
      score += 10;
    }

    return score;
  }

  private static calculateHistoryScore(product: Product, orderHistory: Order[]): number {
    // Implementation for purchase history scoring
    return 15; // Placeholder
  }

  private static calculateSeasonalityScore(product: Product): number {
    const currentSeason = this.getCurrentSeason();
    if (product.features?.toLowerCase().includes(currentSeason.toLowerCase())) {
      return 15;
    }
    return 0;
  }
  private static calculateReviewScore(product: Product): number {
    if (!product.averageRating) return 5;
    return Math.min(10, product.averageRating * 2);
  }

  private static getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }
}
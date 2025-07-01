'use server';

/**
 * @fileOverview Provides AI-driven product recommendations based on baby's profile.
 *
 * - productBundler - A function that generates product bundles based on baby's information.
 * - ProductBundlerInput - The input type for the productBundler function.
 * - ProductBundlerOutput - The return type for the productBundler function.
 */

import admin from '@/lib/firebaseAdmin';
const db = admin.firestore();
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Product } from '@/lib/types';

interface ProductScore {
  score: number;
  reasons: string[];
}

interface BundleProduct extends Product {
  matchScore: number;
  reasonForInclusion: string;
  recommendations?: {
    score: number;
    totalFeedback: number;
  } | null;
}

const ProductBundlerInputSchema = z.object({
  babyName: z.string().min(1, "Baby's name is required"),
  ageInMonths: z.number().min(0).max(60),
  weightInKilograms: z.number().min(0).max(30),
  allergies: z.string().optional().default('None'),
  preferences: z.string().optional().default('None'),
  budget: z.number().optional(),
  categories: z.array(z.string()).optional(),
});

const ProductBundlerOutputSchema = z.object({
  bundleDescription: z.string(),
  productIds: z.array(z.string()),
  productNames: z.array(z.string()),
  reasoning: z.string(),
  totalPrice: z.number(),
  matchDetails: z.array(z.object({
    productId: z.string(),
    score: z.number(),
    reason: z.string(),
  })),
});

export type ProductBundlerInput = z.infer<typeof ProductBundlerInputSchema>;
export type ProductBundlerOutput = z.infer<typeof ProductBundlerOutputSchema>;

async function updateRecommendationScores(productId: string, feedback: number) {
  try {
    const recRef = db.collection('productRecommendations').doc(productId);
    await db.runTransaction(async (transaction) => {
      const recDoc = await transaction.get(recRef);
      if (recDoc.exists) {
        const data = recDoc.data()!;
        transaction.update(recRef, {
          score: (data.score || 0) + feedback,
          totalFeedback: (data.totalFeedback || 0) + 1
        });
      } else {
        transaction.set(recRef, {
          productId,
          score: feedback,
          totalFeedback: 1
        });
      }
    });
  } catch (error) {
    console.error('Error updating recommendation scores:', error);
  }
}

function calculateProductScore(product: Product, input: ProductBundlerInput): ProductScore {
  const typedProduct = product as Product;
  const scores = {
    ageMatch: 0,
    safetyMatch: 0,
    preferenceMatch: 0,
    stockAvailability: 0,
    budgetMatch: 0,
    categoryMatch: 0,
    recommendationMatch: 0,
    arContentBonus: 0,
    bundleCompatibility: 0,
    seasonalRelevance: 0,
    developmentalMatch: 0
  };
  const reasons: string[] = [];

  // Age appropriateness (25 points)
  const ageInYears = Math.floor(input.ageInMonths / 12);
  const ageGroups = (product.ageGroup || '').toLowerCase();
  
  if (ageGroups.includes(`${ageInYears}y`) || 
      ageGroups.includes(`${input.ageInMonths}m`) ||
      ageGroups === 'all ages') {
    scores.ageMatch = 25;
    reasons.push(`Perfect for ${input.ageInMonths} month olds`);
  }

  // Developmental stage matching (20 points)
  const developmentalMilestones = getDevelopmentalMilestones(input.ageInMonths);
  if (product.features?.toLowerCase().includes(developmentalMilestones.join(' ').toLowerCase())) {
    scores.developmentalMatch = 20;
    reasons.push('Matches developmental needs');
  }

  // Safety scoring (20 points)
  if (product.features?.toLowerCase().includes('safe') || 
      product.features?.toLowerCase().includes('certified')) {
    scores.safetyMatch = 20;
    reasons.push('Safety certified');
  }

  // Preference matching (20 points)
  const preferences = input.preferences?.toLowerCase().split(',') || [];
  const matches = preferences.filter(pref => 
    product.description?.toLowerCase().includes(pref.trim()) ||
    product.features?.toLowerCase().includes(pref.trim())
  );
  
  if (matches.length > 0) {
    scores.preferenceMatch = Math.min(20, matches.length * 7);
    reasons.push(`Matches preferences: ${matches.join(', ')}`);
  }

  // Seasonal relevance (10 points)
  const season = getCurrentSeason();
  if (product.features?.toLowerCase().includes(season.toLowerCase())) {
    scores.seasonalRelevance = 10;
    reasons.push(`Perfect for ${season}`);
  }

  // Stock availability (10 points)
  if (product.stock > 10) {
    scores.stockAvailability = 10;
    reasons.push('Well stocked');
  }

  // Budget match (15 points)
  if (input.budget && product.price <= input.budget) {
    const budgetRatio = 1 - (product.price / input.budget);
    scores.budgetMatch = Math.min(15, budgetRatio * 15);
    if (scores.budgetMatch > 12) {
      reasons.push('Excellent value for money');
    }
  }

  // Category match (15 points)
  if (input.categories && input.categories.length > 0) {
    const categoryMatches = input.categories.filter(cat => 
      product.category?.toLowerCase().includes(cat.toLowerCase())
    );
    scores.categoryMatch = Math.min(15, categoryMatches.length * 5);
    if (categoryMatches.length > 0) {
      reasons.push(`Matches desired categories: ${categoryMatches.join(', ')}`);
    }
  }

  // AR content bonus (10 points)
  if (product.arModelUrl) {
    scores.arContentBonus = 10;
    reasons.push('Includes AR preview');
  }

  // Add recommendation score weight (15 points)
  if (product.recommendations?.score) {
    const recommendationWeight = (product.recommendations.score / product.recommendations.totalFeedback) * 15;
    scores.recommendationMatch = Math.min(15, recommendationWeight);
    if (recommendationWeight > 12) {
      reasons.push('Highly rated by similar customers');
    }
  }

  // Bundle compatibility score (20 points)
  scores.bundleCompatibility = 20;
  reasons.push('Compatible with bundle items');

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  return { score: Math.min(150, totalScore), reasons };
}

function getDevelopmentalMilestones(ageInMonths: number): string[] {
  const milestones: Record<number, string[]> = {
    0: ['head control', 'visual tracking', 'reflex'],
    3: ['rolling over', 'grasping', 'cooing'],
    6: ['sitting', 'babbling', 'solid food'],
    9: ['crawling', 'object permanence', 'pincer grasp'],
    12: ['walking', 'first words', 'self-feeding'],
    18: ['running', 'stacking', 'vocabulary'],
    24: ['sentences', 'imaginative play', 'coordination']
  };

  const closest = Math.max(...Object.keys(milestones)
    .map(Number)
    .filter(age => age <= ageInMonths));

  return milestones[closest] || [];
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

export async function productBundler(input: ProductBundlerInput): Promise<ProductBundlerOutput> {
  try {
    // Get available products
    const productsSnap = await db.collection('products')
      .where('stock', '>', 0)
      .get();
    const products: BundleProduct[] = productsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as BundleProduct))
      .filter(product =>
        product.ageGroup === 'All Ages' ||
        (product.ageGroup && product.ageGroup.includes(`${Math.floor(input.ageInMonths / 12)}Y`)) ||
        (product.ageGroup && product.ageGroup.includes(`${input.ageInMonths}M`))
      );

    // Score and rank products
    const scoredProducts: BundleProduct[] = products.map((product: BundleProduct) => {
      const { score, reasons } = calculateProductScore(product, input);
      return {
        ...product,
        matchScore: score,
        reasonForInclusion: reasons.join('; ')
      };
    });

    // Sort by score and select top products
    const selectedProducts = scoredProducts
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);

    const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    const discountedPrice = totalPrice * 0.9; // 10% bundle discount

    return {
      bundleDescription: `Cosmic Bundle for ${input.babyName} (${input.ageInMonths} months): A carefully curated collection of ${selectedProducts.length} essential items for your little star's journey.`,
      productIds: selectedProducts.map(p => p.id),
      productNames: selectedProducts.map(p => p.name),
      reasoning: `This bundle was created considering ${input.babyName}'s age, preferences, and safety requirements. Save ${(totalPrice - discountedPrice).toFixed(2)} with our bundle discount!`,
      totalPrice: discountedPrice,
      matchDetails: selectedProducts.map(p => ({
        productId: p.id,
        score: p.matchScore,
        reason: p.reasonForInclusion
      }))
    };
  } catch (error: any) {
    console.error('Error in product bundler:', error);
    throw new Error(error.message || 'Failed to generate product recommendations');
  }
}

export const productBundlerFlow = ai.defineFlow({
  name: 'productBundlerFlow',
  inputSchema: ProductBundlerInputSchema,
  outputSchema: ProductBundlerOutputSchema,
}, async (input) => {
  try {
    // Get available products
    const productsSnap = await db.collection('products')
      .where('stock', '>', 0)
      .get();
    const products: BundleProduct[] = productsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as BundleProduct))
      .filter(product =>
        product.ageGroup === 'All Ages' ||
        (product.ageGroup && product.ageGroup.includes(`${Math.floor(input.ageInMonths / 12)}Y`)) ||
        (product.ageGroup && product.ageGroup.includes(`${input.ageInMonths}M`))
      );

    // Score and rank products
    const scoredProducts: BundleProduct[] = products.map((product: BundleProduct) => {
      const { score, reasons } = calculateProductScore(product, input);
      return {
        ...product,
        matchScore: score,
        reasonForInclusion: reasons.join('; ')
      };
    });

    // Sort by score and select top products
    const selectedProducts = scoredProducts
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);

    const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    const discountedPrice = totalPrice * 0.9; // 10% bundle discount

    return {
      bundleDescription: `Cosmic Bundle for ${input.babyName} (${input.ageInMonths} months): A carefully curated collection of ${selectedProducts.length} essential items for your little star's journey.`,
      productIds: selectedProducts.map(p => p.id),
      productNames: selectedProducts.map(p => p.name),
      reasoning: `This bundle was created considering ${input.babyName}'s age, preferences, and safety requirements. Save ${(totalPrice - discountedPrice).toFixed(2)} with our bundle discount!`,
      totalPrice: discountedPrice,
      matchDetails: selectedProducts.map(p => ({
        productId: p.id,
        score: p.matchScore,
        reason: p.reasonForInclusion
      }))
    };
  } catch (error: any) {
    console.error('Error in product bundler:', error);
    throw new Error(error.message || 'Failed to generate product recommendations');
  }
});

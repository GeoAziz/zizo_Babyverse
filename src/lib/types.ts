
import type { User as PrismaUser, Product as PrismaProduct, Order as PrismaOrderFull, OrderItem as PrismaOrderItemFull, CartItem as PrismaCartItemFull, Baby as PrismaBaby } from '@prisma/client';

export interface Product extends PrismaProduct {
  // Prisma Product model should have all necessary fields like dataAiHint
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  quote: string;
  imageUrl?: string;
  dataAiHint?: string; 
  stars: number;
}

export interface User extends PrismaUser { 
  babies?: BabyProfile[]; // Relation from Prisma
}

export interface BabyProfile extends PrismaBaby {
  // PrismaBaby already includes id, name, ageInMonths, etc.
  // Ensure this matches your Prisma model structure for Baby
}


export interface OrderItem extends PrismaOrderItemFull {
  // PrismaOrderItem already has productId, name, quantity, price
}

export interface Order extends PrismaOrderFull {
  items: OrderItem[]; 
}


// For AI Baby Assistant Form
export interface BabyNeedsForm {
  babyName: string;
  ageInMonths: string; 
  weightInKilograms: string; 
  allergies: string;
  preferences: string;
}

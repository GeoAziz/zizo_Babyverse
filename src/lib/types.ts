
import type { User as PrismaUser, Product as PrismaProduct, Order as PrismaOrderFull, OrderItem as PrismaOrderItemFull, CartItem as PrismaCartItemFull } from '@prisma/client';

export interface Product extends PrismaProduct {
  reviews?: Review[]; // This was from an old mock, can be removed if not used or integrated with Prisma
  // Prisma Product model should have all necessary fields like dataAiHint
}

export interface Review { // Consider integrating into Prisma Product if needed
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
  dataAiHint?: string; // Added for consistency
  stars: number;
}

export interface User extends PrismaUser { // PrismaUser already has id, name, email, role
  babyProfiles?: BabyProfile[]; // Prisma relation
  orders?: Order[];           // Prisma relation
  wishlist?: string[];        // This was mock, now handled by WishlistItem relation
}

export interface BabyProfile { // Corresponds to Prisma Baby model
  id: string;
  name: string;
  ageInMonths: number;
  weightInKilograms: number; // Consider if this is part of Prisma Baby model
  allergies?: string; 
  preferences?: string;
}

// CartItem is now defined by PrismaCartItemFull & CartItemWithProduct (in api/cart/route.ts)
// export interface CartItem extends Product {
//   quantity: number;
// }

// OrderItem is defined by PrismaOrderItemFull
export interface OrderItem extends PrismaOrderItemFull {
  // PrismaOrderItem already has productId, name, quantity, price
}

// Order is defined by PrismaOrderFull
export interface Order extends PrismaOrderFull {
  items: OrderItem[]; // Relation from Prisma
}


// For AI Baby Assistant Form - this can remain as is for form handling
export interface BabyNeedsForm {
  babyName: string;
  ageInMonths: string; 
  weightInKilograms: string; 
  allergies: string;
  preferences: string;
}

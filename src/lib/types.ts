import type { User as PrismaUser, Product as PrismaProduct, Order as PrismaOrderFull, OrderItem as PrismaOrderItemFull, CartItem as PrismaCartItemFull, Baby as PrismaBaby } from '@prisma/client';

export interface Product extends PrismaProduct {
  reviews?: Array<{ rating: number }>;
  recommendations?: {
    score: number;
    totalFeedback: number;
  } | null;
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
  emailVerificationToken: string | null; // Added emailVerificationToken
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

export interface CartItem extends PrismaCartItemFull {
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutSession {
  id: string;
  cartId: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed';
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface PaymentMethod {
  type: 'card' | 'mpesa';
  // Card details if type is 'card'
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  // Mpesa details if type is 'mpesa'
  phoneNumber?: string;
}

// For AI Baby Assistant Form
export interface BabyNeedsForm {
  babyName: string;
  ageInMonths: string; 
  weightInKilograms: string; 
  allergies: string;
  preferences: string;
}

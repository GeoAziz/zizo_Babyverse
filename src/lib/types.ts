// All types are Firestore-based. No Prisma types remain.

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  reviews?: Array<{ rating: number }>;
  tags?: string[];
  ageGroup?: string;
  ecoTag?: boolean;
  averageRating?: number;
  features?: string;
  targetAudience?: string;
  keywords?: string;
  dataAiHint?: string;
  createdAt?: Date;
  arModelUrl?: string;
  recommendations?: {
    score: number;
    totalFeedback: number;
  } | null;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  quote: string;
  imageUrl?: string;
  dataAiHint?: string;
  stars: number;
  // legacy fields for compatibility
  userId?: string;
  content?: string;
  createdAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  firebaseUid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  phone?: string;
  defaultShippingAddress?: ShippingAddress;
}

export interface BabyProfile {
  id: string;
  userId: string;
  name: string;
  ageInMonths: number;
  weightInKilograms?: number;
  allergies?: string;
  preferences?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: any;
  paymentMethod?: string;
  paymentStatus?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
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
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  phoneNumber?: string;
}

export interface BabyNeedsForm {
  babyName: string;
  ageInMonths: string; 
  weightInKilograms: string; 
  allergies: string;
  preferences: string;
}

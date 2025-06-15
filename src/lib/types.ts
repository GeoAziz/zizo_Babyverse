export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  tags?: string[];
  ageGroup?: string;
  ecoTag?: boolean;
  reviews?: Review[];
  features?: string[]; // For AI product description
  targetAudience?: string; // For AI product description
  keywords?: string; // For AI product description
  averageRating?: number;
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
  stars: number;
}

export interface User {
  id:string;
  name: string;
  email: string;
  babyProfiles?: BabyProfile[];
  orders?: Order[];
  wishlist?: string[]; // Array of product IDs
  // other fields like address, etc.
}

export interface BabyProfile {
  id: string;
  name: string;
  ageInMonths: number;
  weightInKilograms: number;
  allergies?: string; // comma-separated
  preferences?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; // price at time of order
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Pod Packed' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Cancelled';
  orderDate: string;
  shippingAddress: any; // Replace with actual address type
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// For AI Baby Assistant Form
export interface BabyNeedsForm {
  babyName: string;
  ageInMonths: string; // Input as string, convert to number
  weightInKilograms: string; // Input as string, convert to number
  allergies: string;
  preferences: string;
}

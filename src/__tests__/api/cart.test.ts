import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { Cart, CartItem, PrismaClient, Prisma, Role } from '@prisma/client';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Extend CartItem to include all required fields
type FullCartItem = CartItem & {
  cartId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  product?: any;
};

// Extend Cart to include items
type FullCart = Cart & {
  items: FullCartItem[];
};

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

// Mock next-auth session
const mockSession: Session = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: Role.PARENT
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// Configure mocks
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockSession))
}));

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    },
    cartItem: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn()
    },
    product: {
      findUnique: jest.fn()
    }
  }
}));

// Mock product data
const mockProduct = {
  id: 'product-1',
  name: 'Test Product',
  price: 10.99,
  stock: 10,
  description: 'Test Description',
  category: 'Test Category',
  imageUrl: null,
  dataAiHint: null,
  tags: [],
  ageGroup: null,
  ecoTag: false,
  averageRating: 4.5,
  features: null,
  targetAudience: null,
  keywords: null,
  arModelUrl: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

import { GET, POST, PUT, DELETE } from '@/app/api/cart/route';

describe('Cart API', () => {
  const mockRequest = new NextRequest(new URL('http://localhost'));
  const mockDate = new Date("2025-06-21T18:56:22.221Z");

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default product mock
    jest.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct);
  });

  describe('GET /api/cart', () => {
    it('should return user cart', async () => {
      const mockCart: FullCart = {
        id: 'cart-1',
        userId: 'test-user-id',
        items: [],
        createdAt: mockDate,
        updatedAt: mockDate
      };
      
      jest.mocked(prisma.cart.findUnique).mockResolvedValueOnce(mockCart);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...mockCart,
        createdAt: mockCart.createdAt.toISOString(),
        updatedAt: mockCart.updatedAt.toISOString()
      });
    });

    it('should create new cart if none exists', async () => {
      jest.mocked(prisma.cart.findUnique).mockResolvedValueOnce(null);
      jest.mocked(prisma.cart.create).mockResolvedValueOnce({
        id: 'new-cart',
        userId: 'test-user-id',
        items: [],
        createdAt: mockDate,
        updatedAt: mockDate
      } as FullCart);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('new-cart');
    });
  });

  describe('POST /api/cart', () => {    
    it('should add item to cart', async () => {
      const mockRequestBody = {
        productId: 'product-1',
        quantity: 2
      };

      const mockRequest = new NextRequest(
        new URL('http://localhost'),
        {
          method: 'POST',
          body: JSON.stringify(mockRequestBody)
        }
      );
      
      const mockCart: FullCart = {
        id: 'cart-1',
        userId: 'test-user-id',
        items: [],
        createdAt: mockDate,
        updatedAt: mockDate
      };      jest.mocked(prisma.cart.findUnique).mockResolvedValueOnce(mockCart);
      jest.mocked(prisma.product.findUnique).mockResolvedValueOnce(mockProduct);
      jest.mocked(prisma.cartItem.findFirst).mockResolvedValueOnce(null);
      const mockCartItem: FullCartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        userId: 'test-user-id',
        productId: mockRequestBody.productId,
        quantity: mockRequestBody.quantity,
        createdAt: mockDate,
        updatedAt: mockDate
      };
      jest.mocked(prisma.cartItem.create).mockResolvedValueOnce(mockCartItem);
      jest.mocked(prisma.cart.findUnique).mockResolvedValueOnce({
        ...mockCart,
        items: [mockCartItem]
      } as Cart & { items: CartItem[] });

      const response = await POST(mockRequest);
      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/cart', () => {    
    it('should update cart item quantity', async () => {
      const mockRequestBody = {
        productId: 'product-1',
        quantity: 3
      };

      const mockRequest = new NextRequest(
        new URL('http://localhost'),
        {
          method: 'PUT',
          body: JSON.stringify(mockRequestBody)
        }
      );

      const mockCartItem: FullCartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        userId: 'test-user-id',
        productId: 'product-1',
        quantity: 1,
        createdAt: mockDate,
        updatedAt: mockDate,
        product: mockProduct
      };

      const mockCart: FullCart = {
        id: 'cart-1',
        userId: 'test-user-id',
        items: [mockCartItem],
        createdAt: mockDate,
        updatedAt: mockDate
      };      jest.mocked(prisma.cart.findUnique).mockResolvedValueOnce(mockCart);
      jest.mocked(prisma.cartItem.update).mockResolvedValueOnce({
        ...mockCartItem,
        quantity: mockRequestBody.quantity
      });
      jest.mocked(prisma.cart.findUnique).mockResolvedValueOnce({
        ...mockCart,
        items: [{...mockCartItem, quantity: mockRequestBody.quantity}]
      } as Cart & { items: CartItem[] });

      const response = await PUT(mockRequest);
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear cart', async () => {
      const mockCart: Cart = {
        id: 'cart-1',
        userId: 'test-user-id',
        createdAt: mockDate,
        updatedAt: mockDate
      };

      jest.mocked(prisma.cart.findUnique).mockResolvedValueOnce(mockCart);
      jest.mocked(prisma.cartItem.deleteMany).mockResolvedValueOnce({ count: 1 });
      jest.mocked(prisma.cart.delete).mockResolvedValueOnce(mockCart);

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Cart cleared successfully');
    });
  });
});
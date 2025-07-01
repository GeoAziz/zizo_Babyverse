import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  },
  cart: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  },
  cartItem: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn()
  },
  product: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  },
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  }
};

jest.mock('@/lib/db', () => ({
  prisma: mockPrisma,
  __esModule: true
}));

// Silence console.log during tests
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
};
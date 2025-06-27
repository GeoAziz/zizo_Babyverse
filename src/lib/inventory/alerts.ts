import { prisma } from '@/lib/db';

export const LOW_STOCK_THRESHOLD = 10;
export const CRITICAL_STOCK_THRESHOLD = 5;

export async function checkInventoryLevels() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: LOW_STOCK_THRESHOLD
        }
      }
    });

    for (const product of lowStockProducts) {
      if (product.stock <= CRITICAL_STOCK_THRESHOLD) {
        // Email alerts are disabled
      }
    }

    return {
      lowStock: lowStockProducts.length,
      criticalStock: lowStockProducts.filter((p: { stock: number }) => p.stock <= CRITICAL_STOCK_THRESHOLD).length,
      products: lowStockProducts
    };
  } catch (error) {
    console.error('Error checking inventory levels:', error);
    throw error;
  }
}

export async function updateStockLevel(productId: string, quantity: number, operation: 'add' | 'subtract') {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: operation === 'add' ? { increment: quantity } : { decrement: quantity }
      }
    });
    return product;
  } catch (error) {
    console.error('Error updating stock level:', error);
    throw error;
  }
}
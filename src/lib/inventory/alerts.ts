import { sendLowStockAlert } from '@/lib/email/sendgrid';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import serviceAccount from '../../../serviceaccountkey.json';

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

export const LOW_STOCK_THRESHOLD = 10;
export const CRITICAL_STOCK_THRESHOLD = 5;

export async function checkInventoryLevels() {
  try {
    const lowStockProductsSnap = await db.collection('products').where('stock', '<=', LOW_STOCK_THRESHOLD).get();
    const lowStockProducts = lowStockProductsSnap.docs.map(doc => doc.data());

    for (const product of lowStockProducts) {
      if (product.stock <= CRITICAL_STOCK_THRESHOLD) {
        // Send immediate alert for critical stock
        await sendLowStockAlert(product.name, product.stock);
      }
    }

    return {
      lowStock: lowStockProducts.length,
      criticalStock: lowStockProducts.filter(p => p.stock <= CRITICAL_STOCK_THRESHOLD).length,
      products: lowStockProducts
    };
  } catch (error) {
    console.error('Error checking inventory levels:', error);
    throw error;
  }
}

export async function updateStockLevel(productId: string, quantity: number, operation: 'add' | 'subtract') {
  try {
    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new Error('Product not found');
    }

    const productData = productSnap.data();
    if (!productData) {
      throw new Error('Product data is undefined');
    }
    const newStockLevel = operation === 'add' ? productData.stock + quantity : productData.stock - quantity;

    await productRef.update({ stock: newStockLevel });

    if (newStockLevel <= LOW_STOCK_THRESHOLD) {
      await sendLowStockAlert(productData.name, newStockLevel);
    }

    return { id: productId, ...productData, stock: newStockLevel };
  } catch (error) {
    console.error('Error updating stock level:', error);
    throw error;
  }
}
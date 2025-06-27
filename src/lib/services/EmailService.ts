import type { Order, OrderItem, Product, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// EmailService: All email functionality is disabled (SendGrid removed)
export class EmailService {
  static async sendOrderConfirmationEmail(order: Order & { items: OrderItem[] }, customer: User) {
    // Email sending is disabled
    return;
  }

  static async sendLowStockNotification(product: Product) {
    // Email sending is disabled
    return;
  }

  static async sendShippingUpdateEmail(order: Order, customer: User, trackingInfo: any) {
    // Email sending is disabled
    return;
  }
  static async sendWelcomeEmail(user: User) {
    try {
      const verificationToken = await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      // Email sending is disabled
      return;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  static async sendReport(to: string, type: string, data: any) {
    try {
      // Email sending is disabled
      return;
    } catch (error) {
      console.error('Failed to send report:', error);
      throw new Error('Failed to send report email');
    }
  }
}
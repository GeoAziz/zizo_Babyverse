import { sendEmail, sendLowStockAlert, sendOrderConfirmation, sendShippingUpdate } from '@/lib/email/sendgrid';
import type { Order, OrderItem, Product, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export class EmailService {  static async sendOrderConfirmationEmail(order: Order & { items: OrderItem[] }, customer: User) {
    try {
      await sendOrderConfirmation({
        customerEmail: customer.email,
        id: order.id,
        items: order.items,
        total: order.totalAmount,
        shippingAddress: order.shippingAddress
      });
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  static async sendLowStockNotification(product: Product) {
    try {
      await sendLowStockAlert(product.name, product.stock);
    } catch (error) {
      console.error('Failed to send low stock alert:', error);
      throw new Error('Failed to send low stock notification');
    }
  }

  static async sendShippingUpdateEmail(order: Order, customer: User, trackingInfo: any) {
    try {
      await sendShippingUpdate({
        customerEmail: customer.email,
        id: order.id,
        trackingNumber: trackingInfo.trackingNumber,
        estimatedDelivery: trackingInfo.estimatedDelivery
      });
    } catch (error) {
      console.error('Failed to send shipping update:', error);
      throw new Error('Failed to send shipping update email');
    }
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

      await sendEmail(
        user.email,
        'WELCOME',
        {
          name: user.name,
          verificationUrl: `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken.token}`
        }
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  static async sendReport(to: string, type: string, data: any) {
    try {
      await sendEmail(to, type as any, data);
    } catch (error) {
      console.error('Failed to send report:', error);
      throw new Error('Failed to send report email');
    }
  }
}
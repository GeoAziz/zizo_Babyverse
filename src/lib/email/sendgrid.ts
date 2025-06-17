import sgMail from '@sendgrid/mail';
import { env } from '@/lib/env';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendOrderConfirmation = async (to: string, orderData: any) => {
  try {
    const msg = {
      to,
      from: 'orders@babyverse.com',
      subject: `Order Confirmed - #${orderData.id}`,
      templateId: 'd-xxxxxxxxxxxxx', // Your SendGrid template ID
      dynamicTemplateData: {
        orderId: orderData.id,
        customerName: orderData.shippingAddress.fullName,
        orderTotal: orderData.totalAmount,
        orderItems: orderData.items,
        shippingAddress: orderData.shippingAddress,
      },
    };
    
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

export const sendPasswordReset = async (to: string, resetToken: string) => {
  try {
    const msg = {
      to,
      from: 'security@babyverse.com',
      subject: 'Password Reset Request',
      templateId: 'd-xxxxxxxxxxxxx', // Your SendGrid template ID
      dynamicTemplateData: {
        resetLink: `${env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
      },
    };
    
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
import sgMail from '@sendgrid/mail';
import { env } from '@/lib/env';

sgMail.setApiKey(env.SENDGRID_API_KEY);

type EmailTemplate = 'ORDER_CONFIRMATION' | 'SHIPPING_UPDATE' | 'LOW_STOCK_ALERT' | 'PROMOTION' | 'WELCOME';

const templates: Record<EmailTemplate, string> = {
  ORDER_CONFIRMATION: 'd-your-order-template-id',
  SHIPPING_UPDATE: 'd-your-shipping-template-id',
  LOW_STOCK_ALERT: 'd-your-stock-alert-template-id',
  PROMOTION: 'd-your-promo-template-id',
  WELCOME: 'd-your-welcome-template-id'
};

export async function sendEmail(to: string, template: EmailTemplate, data: any) {
  try {
    const msg = {
      to,
      from: 'your@babyverse.com',
      templateId: templates[template],
      dynamic_template_data: data,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('SendGrid Error:', error);
    throw error;
  }
}

export async function sendLowStockAlert(productName: string, currentStock: number) {
  return sendEmail(
    'admin@babyverse.com',
    'LOW_STOCK_ALERT',
    {
      productName,
      currentStock,
      restockLink: `${env.NEXTAUTH_URL}/admin/products`
    }
  );
}

export async function sendOrderConfirmation(orderDetails: any) {
  return sendEmail(
    orderDetails.customerEmail,
    'ORDER_CONFIRMATION',
    {
      orderNumber: orderDetails.id,
      items: orderDetails.items,
      total: orderDetails.total,
      shippingAddress: orderDetails.shippingAddress
    }
  );
}

export async function sendShippingUpdate(orderDetails: any) {
  return sendEmail(
    orderDetails.customerEmail,
    'SHIPPING_UPDATE',
    {
      orderNumber: orderDetails.id,
      trackingNumber: orderDetails.trackingNumber,
      estimatedDelivery: orderDetails.estimatedDelivery
    }
  );
}
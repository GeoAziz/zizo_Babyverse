import { env } from '@/lib/env';
import * as paypal from '@paypal/checkout-server-sdk';

// Initialize PayPal client
const environment = env.PAYPAL_MODE === 'sandbox' 
  ? new paypal.core.SandboxEnvironment(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.LiveEnvironment(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

export const createPayPalOrder = async (amount: number) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2),
        }
      }]
    });

    const order = await client.execute(request);
    return order;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

export const capturePayPalPayment = async (orderId: string) => {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await client.execute(request);
    return capture;
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    throw error;
  }
};
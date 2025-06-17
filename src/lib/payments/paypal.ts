import { env } from '@/lib/env';
import { PayPalHttpClient, Environment } from '@paypal/checkout-server-sdk';

const environment = env.PAYPAL_MODE === 'sandbox' 
  ? new Environment.Sandbox(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET)
  : new Environment.Live(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET);

const client = new PayPalHttpClient(environment);

export const createPayPalOrder = async (amount: number) => {
  try {
    const request = new Orders.OrdersCreateRequest();
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
    const request = new Orders.OrdersCaptureRequest(orderId);
    const capture = await client.execute(request);
    return capture;
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    throw error;
  }
};
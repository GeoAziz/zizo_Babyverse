import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { capturePayPalPayment } from '@/lib/payments/paypal';

export async function POST(req: Request) {
  const body = await req.text();
  const webhookId = env.PAYPAL_WEBHOOK_ID;  const headersList = await headers();
  const transmissionId = headersList.get('paypal-transmission-id');
  const transmissionTime = headersList.get('paypal-transmission-time');
  const certUrl = headersList.get('paypal-cert-url');
  const authAlgo = headersList.get('paypal-auth-algo');
  const transmissionSig = headersList.get('paypal-transmission-sig');

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return NextResponse.json({ error: 'Missing PayPal headers' }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);
    
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        const paymentCapture = event.resource;
        
        // TODO: Update order and payment status in Firestore
        // Example:
        // await firestore.collection('orders').doc(paymentCapture.custom_id).update({
        //   status: 'Processing',
        //   paymentStatus: 'Paid',
        // });
        // await firestore.collection('payments').add({
        //   orderId: paymentCapture.custom_id,
        //   amount: parseFloat(paymentCapture.amount.value),
        //   currency: paymentCapture.amount.currency_code,
        //   provider: 'PAYPAL',
        //   status: 'COMPLETED',
        //   paymentId: paymentCapture.id,
        //   metadata: paymentCapture,
        // });
        // await firestore.collection('notifications').add({
        //   userId: order.userId,
        //   type: 'PAYMENT',
        //   title: 'Payment Successful',
        //   message: `Your payment of ${paymentCapture.amount.value} ${paymentCapture.amount.currency_code} has been processed.`,
        //   orderId: order.id,
        // });
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        const failedPayment = event.resource;
        
        // TODO: Update order status in Firestore
        // Example:
        // await firestore.collection('orders').doc(failedPayment.custom_id).update({
        //   status: 'Pending',
        //   paymentStatus: 'Failed',
        // });
        // await firestore.collection('notifications').add({
        //   userId: order.userId,
        //   type: 'PAYMENT',
        //   title: 'Payment Failed',
        //   message: 'Your payment could not be processed. Please try again.',
        //   orderId: order.id,
        // });
        break;

      default:
        console.log('Unhandled PayPal webhook event:', event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error processing PayPal webhook:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}
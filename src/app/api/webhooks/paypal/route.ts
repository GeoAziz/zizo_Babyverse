import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';
import { capturePayPalPayment } from '@/lib/payments/paypal';

type TransactionClient = {
  order: PrismaClient['order'];
  payment: PrismaClient['payment'];
  notification: PrismaClient['notification'];
};

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
        
        // Update order and payment status in database
        await prisma.$transaction(async (tx: TransactionClient) => {
          // Update order status
          const order = await tx.order.update({
            where: { id: paymentCapture.custom_id },
            data: {
              status: 'Processing',
              paymentStatus: 'Paid',
            },
          });

          // Create payment record
          await tx.payment.create({
            data: {
              orderId: order.id,
              amount: parseFloat(paymentCapture.amount.value),
              currency: paymentCapture.amount.currency_code,
              provider: 'PAYPAL',
              status: 'COMPLETED',
              paymentId: paymentCapture.id,
              metadata: paymentCapture,
            },
          });

          // Create notification
          await tx.notification.create({
            data: {
              userId: order.userId,
              type: 'PAYMENT',
              title: 'Payment Successful',
              message: `Your payment of ${paymentCapture.amount.value} ${paymentCapture.amount.currency_code} has been processed.`,
              orderId: order.id,
            },
          });
        });
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        const failedPayment = event.resource;
        
        await prisma.$transaction(async (tx: TransactionClient) => {
          const order = await tx.order.update({
            where: { id: failedPayment.custom_id },
            data: {
              status: 'Pending',
              paymentStatus: 'Failed',
            },
          });

          await tx.notification.create({
            data: {
              userId: order.userId,
              type: 'PAYMENT',
              title: 'Payment Failed',
              message: 'Your payment could not be processed. Please try again.',
              orderId: order.id,
            },
          });
        });
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
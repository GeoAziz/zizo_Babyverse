import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import * as paypal from '@paypal/checkout-server-sdk';

const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email("Valid email is required"),
});

const CreateOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.enum(['stripe', 'paypal']),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

const paypalEnv = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv);

// Dynamic URL helper function
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  console.log('Using base URL:', baseUrl);
  return baseUrl;
}

// --- STRIPE CHECKOUT SESSION CREATION ---
export async function POST(request: NextRequest) {
  // Fix: getServerSession expects (req, res, authOptions)
  const req = { headers: Object.fromEntries(request.headers.entries()) } as any;
  const res = { getHeader() {}, setCookie() {}, setHeader() {} } as any;
  const session = await getServerSession(req, res, authOptions);
  if (!session || !('user' in session) || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { shippingAddress, paymentMethod } = validation.data;
    const userId: string = (session.user as any).id;
    // Get cart
    const cartSnap: FirebaseFirestore.DocumentSnapshot = await db.collection('carts').doc(userId).get();
    if (!cartSnap.exists) {
      return NextResponse.json({ message: "Your cart is empty." }, { status: 400 });
    }
    const cart: any = cartSnap.data();
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ message: "Your cart is empty." }, { status: 400 });
    }
    // Ensure all cart items have product data
    const fullCartItems: any[] = [];
    for (const item of cart.items) {
      let product = item.product;
      let productId = product?.id || item.productId;
      if (!productId) {
        return NextResponse.json({ message: `Invalid cart item: missing product id.` }, { status: 400 });
      }
      if (!product) {
        // Fetch product from Firestore
        const productSnap: FirebaseFirestore.DocumentSnapshot = await db.collection('products').doc(productId).get();
        if (!productSnap.exists) {
          return NextResponse.json({ message: `Product not found for cart item.` }, { status: 400 });
        }
        product = { id: productId, ...productSnap.data() };
      }
      // Stock check
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${product.name}.` }, { status: 400 });
      }
      fullCartItems.push({ ...item, product });
    }
    // Calculate total
    const totalAmount = fullCartItems.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0) + 5.99;
    // Create order (status: Pending, cart not cleared yet)
    const orderRef = await db.collection('orders').add({
      userId,
      items: fullCartItems,
      totalAmount,
      shippingAddress,
      status: 'Pending',
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Update stock (reserve)
    for (const item of fullCartItems) {
      const productRef = db.collection('products').doc(item.product.id);
      await productRef.update({ stock: db.FieldValue.increment(-item.quantity) });
    }
    // Stripe flow
    if (paymentMethod === 'stripe') {
      const baseUrl = getBaseUrl(request);

      const line_items: typeof stripe.checkout.sessions.create extends (params: { line_items: (infer T)[] } & any) => any ? T[] : any[] = fullCartItems.map((item: any) => ({
        price_data: {
          currency: 'kes',
          product_data: {
            name: item.product.name,
            images: [item.product.imageUrl],
          },
          unit_amount: Math.round(item.product.price * 100 * 100),
        },
        quantity: item.quantity,
      }));
      line_items.push({
        price_data: {
          currency: 'kes',
          product_data: { name: 'Shipping Fee' },
          unit_amount: 599,
        },
        quantity: 1,
      });
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        customer_email: shippingAddress.email,
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout?cancelled=1`,
        metadata: {
          orderId: orderRef.id,
          userId,
        },
      });
      await orderRef.update({ stripeSessionId: stripeSession.id });
      return NextResponse.json({ sessionId: stripeSession.id, url: stripeSession.url, provider: 'stripe' });
    }
    // PayPal flow
    if (paymentMethod === 'paypal') {
      const baseUrl = getBaseUrl(request);

      const paypalRequest = new paypal.orders.OrdersCreateRequest();
      paypalRequest.prefer("return=representation");
      paypalRequest.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
          },
          description: 'Zizo_BabyVerse Order',
        }],
        application_context: {
          brand_name: 'Zizo_BabyVerse',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${baseUrl}/checkout/success?paypal=1&orderId=${orderRef.id}`,
          cancel_url: `${baseUrl}/checkout?cancelled=1`,
        },
      });
      const paypalOrder = await paypalClient.execute(paypalRequest) as { result: any };
      const approvalUrl = paypalOrder.result.links.find((l: any) => l.rel === 'approve')?.href;
      await orderRef.update({ paypalOrderId: paypalOrder.result.id });
      return NextResponse.json({ orderId: paypalOrder.result.id, url: approvalUrl, provider: 'paypal' });
    }
    return NextResponse.json({ message: 'Invalid payment method.' }, { status: 400 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}

// --- STRIPE WEBHOOK HANDLER (for payment confirmation) ---
export async function POST_webhook(request: Request) {
  // Use native Request, not NextRequest, for .text()
  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();
  let event;
  try {
    event = (stripe as any).webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ message: 'Webhook signature verification failed.' }, { status: 400 });
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;
    if (orderId && userId) {
      const orderRef = db.collection('orders').doc(orderId);
      await orderRef.update({ status: 'Paid', paymentIntentId: session.payment_intent });
      // Clear cart after payment
      await db.collection('carts').doc(userId).delete();
      // Send confirmation email
      const orderSnap = await orderRef.get();
      const order = orderSnap.data();
      if (order) {
        await sendOrderConfirmationEmail(order.shippingAddress.email, order, orderId);
      }
    }
  }
  return NextResponse.json({ received: true });
}

// --- EMAIL SENDING (Nodemailer example) ---
async function sendOrderConfirmationEmail(email: string, order: any, orderId: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: 'Zizo_BabyVerse <no-reply@zizobabyverse.com>',
    to: email,
    subject: 'Your Zizo_BabyVerse Order Confirmation',
    html: `<h2>Thank you for your order!</h2><p>Your order <b>#${orderId}</b> is confirmed and in motion 🚀</p>`
  });
}

export async function GET(request: NextRequest) {
  // Fix: getServerSession expects (req, res, authOptions)
  const req = { headers: Object.fromEntries(request.headers.entries()) } as any;
  const res = { getHeader() {}, setCookie() {}, setHeader() {} } as any;
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbInstance = db;
    const ordersSnap = await dbInstance.collection('orders')
      .where('userId', '==', session.user.id)
      .orderBy('createdAt', 'desc')
      .get();
    const orders = ordersSnap.docs.map((doc: FirebaseFirestore.DocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}


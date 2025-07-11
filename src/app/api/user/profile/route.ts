
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import type { ShippingAddress, User, Order } from '@/lib/types';

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
  phone: z.string().optional(),
  defaultShippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().min(1),
  }).optional(),
});


export async function GET(request: NextRequest) {
  // Use next-auth/jwt to extract session from cookies
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  console.log('DEBUG /api/user/profile token:', token);
  if (!token || !token.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use db from firebaseAdmin
    const userRef = db.collection('users').doc(token.id);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }
    // Fetch last 5 orders
    const ordersSnap = await db
      .collection('orders')
      .where('userId', '==', token.id)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    const orders: Order[] = ordersSnap.docs.map((doc: FirebaseFirestore.DocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as Order[];
    return NextResponse.json({ id: userSnap.id, ...userSnap.data(), orders });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Use next-auth/jwt to extract session from cookies
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid profile data", errors: validation.error.flatten() },
        { status: 400 }
      );
    }
    const userRef = db.collection('users').doc(token.id);
    await userRef.set(validation.data, { merge: true });
    const updatedSnap = await userRef.get();
    const updatedProfile = updatedSnap.data();
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Use next-auth/jwt to extract session from cookies
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid profile data", errors: validation.error.flatten() },
        { status: 400 }
      );
    }
    const userRef = db.collection('users').doc(token.id);
    await userRef.set(validation.data, { merge: true });
    const updatedSnap = await userRef.get();
    const updatedProfile = updatedSnap.data();
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
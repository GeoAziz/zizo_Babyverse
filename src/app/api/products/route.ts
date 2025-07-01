import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { Product } from '@/lib/types';

// Schema validation for POST requests
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Valid image URL is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  tags: z.array(z.string()).optional(),
  ageGroup: z.string().optional(),
  ecoTag: z.boolean().optional().default(false),
  averageRating: z.number().min(0).max(5).optional(),
  features: z.string().optional(),
  targetAudience: z.string().optional(),
  keywords: z.string().optional(),
  dataAiHint: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const category = searchParams.get('category');
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = admin.firestore().collection('products');
    if (category) query = query.where('category', '==', category);
    query = query.orderBy('createdAt', 'desc');
    if (limit) query = query.limit(limit);
    const snap = await query.get();
    const products: Product[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const docRef = await admin.firestore().collection('products').add({
      ...validation.data,
      createdAt: new Date(),
    });
    const newProductSnap = await docRef.get();

    return NextResponse.json({ id: docRef.id, ...newProductSnap.data() }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}

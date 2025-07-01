import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role } from '@/lib/auth';

const db = admin.firestore();

const productUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.number().positive("Price must be positive").optional(),
  category: z.string().min(1, "Category is required").optional(),
  imageUrl: z.string().url("Valid image URL is required").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  tags: z.array(z.string()).optional(),
  ageGroup: z.string().optional().nullable(), // Allow null
  ecoTag: z.boolean().optional(),
  averageRating: z.number().min(0).max(5).optional().nullable(), // Allow null
  features: z.string().optional().nullable(), // Allow null
  targetAudience: z.string().optional().nullable(), // Allow null
  keywords: z.string().optional().nullable(), // Allow null
  dataAiHint: z.string().optional().nullable(), // Allow null
});


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // Validate if ID is a CUID
    if (!id || id.length < 20) {
      return NextResponse.json({ message: "Invalid product ID format" }, { status: 400 });
    }

    const doc = await db.collection('products').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    await db.collection('products').doc(id).set(validation.data, { merge: true });
    const updatedDoc = await db.collection('products').doc(id).get();

    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error(`Error updating product`, error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const params = await context.params;
    const { id } = params;
    await db.collection('products').doc(id).delete();
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting product`, error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}

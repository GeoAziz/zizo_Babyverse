
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role } from '@prisma/client';

const productUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.number().positive("Price must be positive").optional(),
  category: z.string().min(1, "Category is required").optional(),
  imageUrl: z.string().url("Valid image URL is required").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  tags: z.array(z.string()).optional(),
  ageGroup: z.string().optional(),
  ecoTag: z.boolean().optional(),
  averageRating: z.number().min(0).max(5).optional(),
  features: z.string().optional(),
  targetAudience: z.string().optional(),
  keywords: z.string().optional(),
  dataAiHint: z.string().optional(),
});


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error fetching product ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: validation.data,
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${params.id}:`, error);
    // Check for Prisma specific error for record not found
    if ((error as any).code === 'P2025') {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting product ${params.id}:`, error);
    if ((error as any).code === 'P2025') {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role } from '@prisma/client';

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

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: validation.data,
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}

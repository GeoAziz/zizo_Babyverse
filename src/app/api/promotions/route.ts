
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role, PromoType as PrismaPromoType, PromoTarget as PrismaPromoTarget } from '@prisma/client';

// Define Zod enums explicitly matching Prisma enums
const ZodPromoType = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);
const ZodPromoTarget = z.enum(['ALL_PRODUCTS', 'SPECIFIC_PRODUCTS', 'SPECIFIC_CATEGORIES']);

const promotionSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  description: z.string().optional(),
  type: ZodPromoType,
  value: z.number().positive("Value must be positive"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().min(0).optional().nullable(),
  minSpend: z.number().min(0).optional().nullable(),
  appliesTo: ZodPromoTarget.optional().nullable(),
  productIds: z.array(z.string()).optional().default([]),
  categoryNames: z.array(z.string()).optional().default([]),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});


export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    // For public access to active promos, adjust logic here.
    // For now, consistent with other admin-gated list endpoints.
  }

  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
      // If public, filter for active:
      // where: { isActive: true, endDate: { gte: new Date() } }
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json({ message: "Failed to fetch promotions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = promotionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { code, type, appliesTo, ...restOfData } = validation.data;

    const existingPromo = await prisma.promotion.findUnique({ where: { code } });
    if (existingPromo) {
      return NextResponse.json({ message: "Promotion code already exists" }, { status: 409 });
    }
    
    const newPromotion = await prisma.promotion.create({
      data: { 
        code, 
        type: type as PrismaPromoType, // Cast to Prisma enum type
        appliesTo: appliesTo as PrismaPromoTarget | null, // Cast to Prisma enum type or null
        ...restOfData 
      },
    });
    return NextResponse.json(newPromotion, { status: 201 });
  } catch (error: any) {
    console.error("Error creating promotion:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({ message: "Promotion code already exists" }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create promotion" }, { status: 500 });
  }
}

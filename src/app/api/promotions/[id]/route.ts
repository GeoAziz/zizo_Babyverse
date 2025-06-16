
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role, PromoType as PrismaPromoType, PromoTarget as PrismaPromoTarget } from '@prisma/client';

// Define Zod enums explicitly matching Prisma enums
const ZodPromoType = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);
const ZodPromoTarget = z.enum(['ALL_PRODUCTS', 'SPECIFIC_PRODUCTS', 'SPECIFIC_CATEGORIES']);

// Schema for updating a promotion (all fields optional)
const promotionUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  type: ZodPromoType.optional(),
  value: z.number().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  usageLimit: z.number().int().min(0).optional().nullable(),
  timesUsed: z.number().int().min(0).optional(),
  minSpend: z.number().min(0).optional().nullable(),
  appliesTo: ZodPromoTarget.optional().nullable(),
  productIds: z.array(z.string()).optional(),
  categoryNames: z.array(z.string()).optional(),
}).refine(data => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
  message: "End date must be after start date if both are provided",
  path: ["endDate"],
});


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: Role }).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: params.id },
    });
    if (!promotion) {
      return NextResponse.json({ message: "Promotion not found" }, { status: 404 });
    }
    return NextResponse.json(promotion);
  } catch (error) {
    console.error(`Error fetching promotion ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to fetch promotion" }, { status: 500 });
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
    const validation = promotionUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { code, ...restOfData } = validation.data;
    
    // Cast validated data to Prisma types where necessary
    const updateData: Partial<Parameters<typeof prisma.promotion.update>[0]['data']> = {
        ...restOfData,
        ...(restOfData.type && { type: restOfData.type as PrismaPromoType }),
        ...(restOfData.appliesTo && { appliesTo: restOfData.appliesTo as PrismaPromoTarget }),
    };
    if (code) {
        updateData.code = code;
        const existingPromoWithCode = await prisma.promotion.findFirst({
            where: { code: code, NOT: { id: params.id } },
        });
        if (existingPromoWithCode) {
            return NextResponse.json({ message: "Another promotion with this code already exists" }, { status: 409 });
        }
    }


    const updatedPromotion = await prisma.promotion.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json(updatedPromotion);
  } catch (error: any) {
    console.error(`Error updating promotion ${params.id}:`, error);
    if (error.code === 'P2025') { 
        return NextResponse.json({ message: "Promotion not found" }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        return NextResponse.json({ message: "Promotion code already exists" }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update promotion" }, { status: 500 });
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
    await prisma.promotion.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Promotion deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting promotion ${params.id}:`, error);
    if (error.code === 'P2025') {
        return NextResponse.json({ message: "Promotion not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to delete promotion" }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PromoType, PromoTarget, type Role } from '@prisma/client'; // Ensure PromoType and PromoTarget are imported

// Schema for updating a promotion (all fields optional)
const promotionUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(PromoType).optional(), // Used imported PromoType
  value: z.number().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  usageLimit: z.number().int().min(0).optional().nullable(),
  timesUsed: z.number().int().min(0).optional(), // Allow updating timesUsed if needed, e.g. manual adjustment
  minSpend: z.number().min(0).optional().nullable(),
  appliesTo: z.nativeEnum(PromoTarget).optional().nullable(), // Used imported PromoTarget
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
  // Admin only to get specific promo by ID
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

    if (code) {
        const existingPromoWithCode = await prisma.promotion.findFirst({
            where: { code: code, NOT: { id: params.id } },
        });
        if (existingPromoWithCode) {
            return NextResponse.json({ message: "Another promotion with this code already exists" }, { status: 409 });
        }
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: params.id },
      data: {
        ...(code && { code }), // Only update code if provided
        ...restOfData,
      },
    });
    return NextResponse.json(updatedPromotion);
  } catch (error: any) {
    console.error(`Error updating promotion ${params.id}:`, error);
    if (error.code === 'P2025') { // Prisma error for record not found
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

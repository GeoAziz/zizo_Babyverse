import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role } from '@/lib/auth';

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
    // Firestore: Fetch promotion by ID
    // TODO: Replace with actual Firestore fetch logic
    const promotion = null;
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
    // Firestore: Update promotion logic here
    // TODO: Check for existing promo with same code, update promotion, etc.
    // Example placeholder:
    // const db = admin.firestore();
    // const promoRef = db.collection('promotions').doc(params.id);
    // await promoRef.set({ ...restOfData, ...(code && { code }) }, { merge: true });
    // const updatedPromotion = (await promoRef.get()).data();
    const updatedPromotion = null;
    return NextResponse.json(updatedPromotion);
  } catch (error: any) {
    console.error(`Error updating promotion ${params.id}:`, error);
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
    // Firestore: Delete promotion logic here
    // Example placeholder:
    // const db = admin.firestore();
    // await db.collection('promotions').doc(params.id).delete();
    return NextResponse.json({ message: "Promotion deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting promotion ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete promotion" }, { status: 500 });
  }
}

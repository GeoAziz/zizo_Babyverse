import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const GrowthRecordSchema = z.object({
  date: z.coerce.date(),
  weight: z.number().optional(),
  height: z.number().optional(),
  headCirc: z.number().optional(),
  notes: z.string().optional()
});

// GET growth records
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ babyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const { babyId } = params;

  try {
    // Verify ownership
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: session.user.id,
      },
    });

    if (!baby) {
      return NextResponse.json({ message: "Baby profile not found or unauthorized" }, { status: 404 });
    }

    const growthRecords = await prisma.growthRecord.findMany({
      where: { babyId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(growthRecords);
  } catch (error) {
    console.error('Error fetching growth records:', error);
    return NextResponse.json({ message: "Failed to fetch growth records" }, { status: 500 });
  }
}

// Create new growth record
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ babyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const { babyId } = params;

  try {
    // Verify ownership
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: session.user.id,
      },
    });

    if (!baby) {
      return NextResponse.json({ message: "Baby profile not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const validation = GrowthRecordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const growthRecord = await prisma.growthRecord.create({
      data: {
        ...validation.data,
        babyId,
      },
    });

    // Update the baby's current weight if provided
    if (validation.data.weight) {
      await prisma.baby.update({
        where: { id: babyId },
        data: { weightInKilograms: validation.data.weight },
      });
    }

    return NextResponse.json(growthRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating growth record:', error);
    return NextResponse.json({ message: "Failed to create growth record" }, { status: 500 });
  }
}

// Update growth record
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ babyId: string; recordId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const { babyId, recordId } = params;

  try {
    // Verify ownership
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: session.user.id,
      },
    });

    if (!baby) {
      return NextResponse.json({ message: "Baby profile not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const validation = GrowthRecordSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const growthRecord = await prisma.growthRecord.update({
      where: { id: recordId },
      data: validation.data,
    });

    return NextResponse.json(growthRecord);
  } catch (error) {
    console.error('Error updating growth record:', error);
    return NextResponse.json({ message: "Failed to update growth record" }, { status: 500 });
  }
}

// Delete growth record
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ babyId: string; recordId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const { babyId, recordId } = params;

  try {
    // Verify ownership
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: session.user.id,
      },
    });

    if (!baby) {
      return NextResponse.json({ message: "Baby profile not found or unauthorized" }, { status: 404 });
    }

    await prisma.growthRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ message: "Growth record deleted successfully" });
  } catch (error) {
    console.error('Error deleting growth record:', error);
    return NextResponse.json({ message: "Failed to delete growth record" }, { status: 500 });
  }
}
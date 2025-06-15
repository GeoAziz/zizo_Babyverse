
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const BabyProfileSchema = z.object({
  name: z.string().min(1, "Baby's name is required."),
  ageInMonths: z.coerce.number().int().min(0, "Age must be a non-negative integer."),
  weightInKilograms: z.coerce.number().positive("Weight must be positive.").optional().nullable(),
  allergies: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const babyProfiles = await prisma.baby.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(babyProfiles);
  } catch (error) {
    console.error("Error fetching baby profiles:", error);
    return NextResponse.json({ message: "Failed to fetch baby profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = BabyProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, ageInMonths, weightInKilograms, allergies, preferences } = validation.data;

    const newBabyProfile = await prisma.baby.create({
      data: {
        userId: session.user.id,
        name,
        ageInMonths,
        weightInKilograms: weightInKilograms || null,
        allergies: allergies || null,
        preferences: preferences || null,
      },
    });

    return NextResponse.json(newBabyProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating baby profile:", error);
    return NextResponse.json({ message: "Failed to create baby profile" }, { status: 500 });
  }
}

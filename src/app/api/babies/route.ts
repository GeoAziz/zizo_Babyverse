import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const BabyProfileSchema = z.object({
  name: z.string().min(1, "Baby's name is required.")
    .max(50, "Name is too long")
    .refine((name: string) => /^[a-zA-Z\s-']+$/.test(name), "Name can only contain letters, spaces, hyphens, and apostrophes"),
  ageInMonths: z.coerce.number().int()
    .min(0, "Age must be a non-negative integer.")
    .max(60, "Age must be 60 months or less"),
  weightInKilograms: z.coerce.number()
    .positive("Weight must be positive.")
    .min(0.5, "Weight must be at least 0.5 kg")
    .max(30, "Weight must be 30 kg or less")
    .optional()
    .nullable(),
  allergies: z.string()
    .max(500, "Allergies description is too long")
    .optional()
    .nullable(),
  preferences: z.string()
    .max(500, "Preferences description is too long")
    .optional()
    .nullable(),
});

export async function GET(request: Request) {
  // Fix getServerSession signature
  const req = { headers: Object.fromEntries(request.headers.entries()) } as any;
  const res = { getHeader() {}, setCookie() {}, setHeader() {} } as any;
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const babyProfiles = await db.collection('babies')
      .where('userId', '==', session.user.id)
      .orderBy('createdAt', 'desc')
      .get();
    const babies = babyProfiles.docs.map((doc: FirebaseFirestore.DocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(babies);
  } catch (error) {
    console.error("Error fetching baby profiles:", error);
    return NextResponse.json({ message: "Failed to fetch baby profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Fix getServerSession signature
  const req = { headers: Object.fromEntries(request.headers.entries()) } as any;
  const res = { getHeader() {}, setCookie() {}, setHeader() {} } as any;
  const session = await getServerSession(req, res, authOptions);
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

    const newBabyProfile = await db.collection('babies').add({
      userId: session.user.id, // Always set userId for security rules
      name,
      ageInMonths,
      weightInKilograms: weightInKilograms || null,
      allergies: allergies || null,
      preferences: preferences || null,
      createdAt: db.FieldValue ? db.FieldValue.serverTimestamp() : new Date(),
    });

    return NextResponse.json({ id: newBabyProfile.id, ...validation.data }, { status: 201 });
  } catch (error) {
    console.error("Error creating baby profile:", error);
    return NextResponse.json({ message: "Failed to create baby profile" }, { status: 500 });
  }
}

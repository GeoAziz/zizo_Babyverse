import { NextResponse, NextRequest } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const UpdateBabyProfileSchema = z.object({
  name: z.string().min(1, "Baby's name is required.").optional(),
  ageInMonths: z.coerce.number().int().min(0, "Age must be a non-negative integer.").optional(),
  weightInKilograms: z.coerce.number().positive("Weight must be positive.").optional().nullable(),
  allergies: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
});

// For GET
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ babyId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { babyId } = params;
  if (!babyId) {
    return NextResponse.json({ message: "Baby ID is required" }, { status: 400 });
  }

  try {
    // Firestore: Fetch baby profile by babyId and userId
    const db = admin.firestore();
    const babyRef = db.collection('babies').doc(babyId);
    const babySnap = await babyRef.get();
    const babyProfile = babySnap.exists ? babySnap.data() : null;
    if (!babyProfile || babyProfile.userId !== session.user.id) {
      return NextResponse.json({ message: "Baby profile not found or you're not authorized to view it" }, { status: 404 });
    }
    return NextResponse.json({ id: babySnap.id, ...babyProfile });
  } catch (error) {
    console.error(`Error fetching baby profile ${babyId}:`, error);
    return NextResponse.json({ message: "Failed to fetch baby profile" }, { status: 500 });
  }
}

// For DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ babyId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { babyId } = params;
  if (!babyId) {
    return NextResponse.json({ message: "Baby ID is required" }, { status: 400 });
  }

  try {
    // Firestore: Fetch baby profile by babyId and userId
    const db = admin.firestore();
    const babyRef = db.collection('babies').doc(babyId);
    const babySnap = await babyRef.get();
    const babyProfile = babySnap.exists ? babySnap.data() : null;
    if (!babyProfile || babyProfile.userId !== session.user.id) {
      return NextResponse.json({ message: "Baby profile not found or you're not authorized to delete it" }, { status: 404 });
    }
    await babyRef.delete();
    return NextResponse.json({ message: "Baby profile deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting baby profile ${babyId}:`, error);
    return NextResponse.json({ message: "Failed to delete baby profile" }, { status: 500 });
  }
}

// For PUT
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ babyId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { babyId } = params;
  if (!babyId) {
    return NextResponse.json({ message: "Baby ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = UpdateBabyProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const db = admin.firestore();
    const babyRef = db.collection('babies').doc(babyId);
    const babySnap = await babyRef.get();
    const babyToUpdate = babySnap.exists ? babySnap.data() : null;
    if (!babyToUpdate || babyToUpdate.userId !== session.user.id) {
      return NextResponse.json({ message: "Baby profile not found or you're not authorized to update it" }, { status: 404 });
    }
    await babyRef.set(validation.data, { merge: true });
    const updatedSnap = await babyRef.get();
    const updatedBabyProfile = updatedSnap.exists ? { id: updatedSnap.id, ...updatedSnap.data() } : null;
    return NextResponse.json(updatedBabyProfile);
  } catch (error: any) {
    console.error(`Error updating baby profile ${babyId}:`, error);
    return NextResponse.json({ message: "Failed to update baby profile" }, { status: 500 });
  }
}

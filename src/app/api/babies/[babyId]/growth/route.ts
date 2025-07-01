import { NextResponse, NextRequest } from 'next/server';
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
    // TODO: Replace with Firestore logic to verify ownership and fetch baby
    // const baby = await firestore.collection('babies').doc(babyId).get();
    // if (!baby.exists || baby.data().userId !== session.user.id) {
    //   return NextResponse.json({ message: "Baby profile not found or unauthorized" }, { status: 404 });
    // }

    // TODO: Replace with Firestore logic to fetch growth records
    // const growthRecords = await firestore.collection('growthRecords').where('babyId', '==', babyId).orderBy('date', 'desc').get();
    // return NextResponse.json(growthRecords.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    return NextResponse.json({ message: 'TODO: Implement Firestore logic' }, { status: 501 });
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
    // TODO: Replace with Firestore logic to verify ownership and fetch baby
    // const baby = await firestore.collection('babies').doc(babyId).get();
    // if (!baby.exists || baby.data().userId !== session.user.id) {
    //   return NextResponse.json({ message: "Baby profile not found or unauthorized" }, { status: 404 });
    // }

    const body = await request.json();
    const validation = GrowthRecordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // TODO: Replace with Firestore logic to create growth record
    // await firestore.collection('growthRecords').add({ ...validation.data, babyId });
    // Optionally update baby's current weight if provided
    // if (validation.data.weight) {
    //   await firestore.collection('babies').doc(babyId).update({ weightInKilograms: validation.data.weight });
    // }

    return NextResponse.json({ message: 'TODO: Implement Firestore logic' }, { status: 501 });
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
    // TODO: Replace with Firestore logic to verify ownership and fetch baby
    // const baby = await firestore.collection('babies').doc(babyId).get();
    // if (!baby.exists || baby.data().userId !== session.user.id) {
    //   return NextResponse.json({ message: "Baby profile not found or unauthorized" }, { status: 404 });
    // }

    const body = await request.json();
    const validation = GrowthRecordSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // TODO: Replace with Firestore logic to update growth record
    // await firestore.collection('growthRecords').doc(recordId).update(validation.data);

    return NextResponse.json({ message: 'TODO: Implement Firestore logic' }, { status: 501 });
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
    // TODO: Replace with Firestore logic to verify ownership and fetch baby
    // const baby = await firestore.collection('babies').doc(babyId).get();
    // if (!baby.exists || baby.data().userId !== session.user.id) {
    //   return NextResponse.json({ message: "Baby profile not found or unauthorized" }, { status: 404 });
    // }

    // TODO: Replace with Firestore logic to delete growth record
    // await firestore.collection('growthRecords').doc(recordId).delete();

    return NextResponse.json({ message: 'TODO: Implement Firestore logic' }, { status: 501 });
  } catch (error) {
    console.error('Error deleting growth record:', error);
    return NextResponse.json({ message: "Failed to delete growth record" }, { status: 500 });
  }
}
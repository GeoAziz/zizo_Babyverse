
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

// Optional: Schema for updates if you implement PUT
// const UpdateBabyProfileSchema = z.object({
//   name: z.string().min(1, "Baby's name is required.").optional(),
//   ageInMonths: z.coerce.number().int().min(0, "Age must be a non-negative integer.").optional(),
//   weightInKilograms: z.coerce.number().positive("Weight must be positive.").optional().nullable(),
//   allergies: z.string().optional().nullable(),
//   preferences: z.string().optional().nullable(),
// });


export async function DELETE(
  request: Request,
  { params }: { params: { babyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { babyId } = params;

  if (!babyId) {
    return NextResponse.json({ message: "Baby ID is required" }, { status: 400 });
  }

  try {
    // Verify the baby profile belongs to the logged-in user before deleting
    const babyProfile = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: session.user.id,
      },
    });

    if (!babyProfile) {
      return NextResponse.json({ message: "Baby profile not found or you're not authorized to delete it" }, { status: 404 });
    }

    await prisma.baby.delete({
      where: { id: babyId },
    });

    return NextResponse.json({ message: "Baby profile deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting baby profile ${babyId}:`, error);
    if (error.code === 'P2025') { // Prisma error for record to delete does not exist
        return NextResponse.json({ message: "Baby profile not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to delete baby profile" }, { status: 500 });
  }
}

// Placeholder for PUT if needed later
// export async function PUT(
//   request: Request,
//   { params }: { params: { babyId: string } }
// ) {
//   const session = await getServerSession(authOptions);
//   if (!session || !session.user || !session.user.id) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const { babyId } = params;
//   if (!babyId) {
//     return NextResponse.json({ message: "Baby ID is required" }, { status: 400 });
//   }

//   try {
//     const body = await request.json();
//     const validation = UpdateBabyProfileSchema.safeParse(body);

//     if (!validation.success) {
//       return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
//     }
    
//     const babyToUpdate = await prisma.baby.findFirst({
//         where: {id: babyId, userId: session.user.id}
//     });

//     if(!babyToUpdate) {
//         return NextResponse.json({message: "Baby profile not found or unauthorized"}, {status: 404});
//     }

//     const updatedBabyProfile = await prisma.baby.update({
//       where: { id: babyId },
//       data: validation.data,
//     });

//     return NextResponse.json(updatedBabyProfile);
//   } catch (error: any) {
//     console.error(`Error updating baby profile ${babyId}:`, error);
//     if (error.code === 'P2025') {
//       return NextResponse.json({ message: "Baby profile not found" }, { status: 404 });
//     }
//     return NextResponse.json({ message: "Failed to update baby profile" }, { status: 500 });
//   }
// }

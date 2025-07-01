import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const MilestoneSchema = z.object({
  category: z.enum(['Motor', 'Language', 'Social', 'Cognitive']),
  name: z.string().min(1, "Milestone name is required"),
  description: z.string().min(1, "Description is required"),
  achieved: z.boolean().default(false),
  targetAge: z.number().int().min(0),
  achievedAt: z.date().nullable().optional(),
  notes: z.string().optional()
});

// GET milestones for a baby
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

    const milestones = await prisma.milestone.findMany({
      where: { babyId },
      orderBy: { targetAge: 'asc' },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ message: "Failed to fetch milestones" }, { status: 500 });
  }
}

// Create new milestone
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
    const validation = MilestoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        ...validation.data,
        babyId,
        achievedAt: validation.data.achieved ? new Date() : null,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json({ message: "Failed to create milestone" }, { status: 500 });
  }
}

// Update milestone
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ babyId: string; milestoneId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const { babyId, milestoneId } = params;

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
    const validation = MilestoneSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // If marking as achieved, set achievedAt
    const data = {
      ...validation.data,
      achievedAt: validation.data.achieved ? new Date() : null,
    };

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data,
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ message: "Failed to update milestone" }, { status: 500 });
  }
}

// Delete milestone
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ babyId: string; milestoneId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const { babyId, milestoneId } = params;

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

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return NextResponse.json({ message: "Milestone deleted successfully" });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json({ message: "Failed to delete milestone" }, { status: 500 });
  }
}
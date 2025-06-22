import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RecommendationService } from '@/lib/services/RecommendationService';
import { prisma } from '@/lib/db';
import type { Baby, Order } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's active baby profile
    const babyProfile: Baby | null = await prisma.baby.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    });

    // Get user preferences (fetch separately if needed)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    // If preferences are stored in a separate table, fetch them here
    // NOTE: If you see 'Property \u0027userPreference\u0027 does not exist',
    // make sure you have only ONE folder for your project (not both 'Zizo_Babyverse' and 'zizo_Babyverse').
    // Delete node_modules, .next, and package-lock.json, then run 'npm install' and 'npx prisma generate'.
    // The correct property is 'userPreference' (singular), as defined in your schema.
    const userPreferences = await prisma.userPreference.findUnique({
      where: { userId: session.user.id }
    }) || undefined;

    // Get order history
    const orderHistory: Order[] = await prisma.order.findMany({
      where: { userId: session.user.id },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    // Generate contextual recommendations
    const recommendations = await RecommendationService.getContextualRecommendations(
      session.user.id,
      {
        babyProfile: babyProfile || undefined,
        userPreferences,
        orderHistory,
        seasonality: true,
      }
    );

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { babyId, budget, preferences } = body;

    // Get specific baby profile if babyId provided and is a string
    const babyProfile: Baby | null = (typeof babyId === 'string' && babyId) ? await prisma.baby.findUnique({
      where: { id: babyId }
    }) : null;

    // Get user preferences from userPreferences table
    const userPreferences = await prisma.userPreference.findUnique({
      where: { userId: session.user.id }
    }) || undefined;

    // Get order history
    const orderHistory: Order[] = await prisma.order.findMany({
      where: { userId: session.user.id },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    // Generate recommendations with custom context
    const recommendations = await RecommendationService.getContextualRecommendations(
      session.user.id,
      {
        babyProfile: babyProfile || undefined,
        userPreferences: { ...(userPreferences || {}), ...preferences },
        orderHistory,
        seasonality: true,
        budget
      }
    );

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
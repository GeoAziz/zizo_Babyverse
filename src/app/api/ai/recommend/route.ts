import { NextResponse } from 'next/server';
import { productBundler } from '@/ai/flows/product-bundler';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const recommendation = await productBundler({
      babyName: body.babyName,
      ageInMonths: body.ageInMonths,
      weightInKilograms: body.weightInKilograms,
      allergies: body.allergies,
      preferences: body.preferences,
    });

    return NextResponse.json(recommendation);
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

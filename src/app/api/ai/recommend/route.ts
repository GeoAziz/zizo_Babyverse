
import { NextResponse } from 'next/server';
import { productBundler, type ProductBundlerInput } from '@/ai/flows/product-bundler';
import { z } from 'genkit'; // Genkit's Zod
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Use the Zod schema defined in the Genkit flow for input validation
const RecommendationInputSchema = z.object({
  babyName: z.string().describe("Baby's name."),
  ageInMonths: z.number().positive().describe("Baby's age in months."),
  weightInKilograms: z.number().positive().describe("Baby's weight in kilograms."),
  allergies: z.string().optional().describe('Comma-separated list of allergies.'),
  preferences: z.string().optional().describe('Baby or parent preferences.'),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = RecommendationInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Construct input for the Genkit flow
    const bundlerInput: ProductBundlerInput = {
      babyName: validation.data.babyName,
      ageInMonths: validation.data.ageInMonths,
      weightInKilograms: validation.data.weightInKilograms,
      allergies: validation.data.allergies || "None",
      preferences: validation.data.preferences || "None",
    };

    const result = await productBundler(bundlerInput);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in AI recommendation route:", error);
    // Check if error is from Genkit and has specific details
    const errorMessage = (error instanceof Error && error.message) ? error.message : "Failed to get AI recommendations";
    return NextResponse.json({ message: "An error occurred with the AI assistant.", error: errorMessage }, { status: 500 });
  }
}

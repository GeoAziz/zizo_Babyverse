
import { NextResponse } from 'next/server';
import { babyverseChatbot, type BabyverseChatbotInput } from '@/ai/flows/babyverse-chatbot';
import { z } from 'genkit'; // Genkit's Zod
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Use the Zod schema defined in the Genkit flow for input validation
const ChatInputSchema = z.object({
  question: z.string().min(1, "Question cannot be empty."),
  babyName: z.string().optional(),
  babyAgeMonths: z.number().optional(),
  babyWeightLbs: z.number().optional(),
  babyAllergies: z.string().optional(),
  babyPreferences: z.string().optional(),
});


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = ChatInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const chatbotInput: BabyverseChatbotInput = validation.data;
    
    const result = await babyverseChatbot(chatbotInput);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in AI chat route:", error);
    const errorMessage = (error instanceof Error && error.message) ? error.message : "Failed to get AI chat response";
    return NextResponse.json({ message: "An error occurred with the AI chatbot.", error: errorMessage }, { status: 500 });
  }
}

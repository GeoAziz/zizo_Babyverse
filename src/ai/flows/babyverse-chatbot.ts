'use server';

/**
 * @fileOverview Implements the BabyVerse chatbot flow.
 *
 * - babyverseChatbot - A function that handles the chatbot interactions.
 * - BabyverseChatbotInput - The input type for the babyverseChatbot function.
 * - BabyverseChatbotOutput - The return type for the babyverseChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BabyverseChatbotInputSchema = z.object({
  question: z.string().describe('The question from the parent.'),
  babyName: z.string().optional().describe('The name of the baby.'),
  babyAgeMonths: z.number().optional().describe('The age of the baby in months.'),
  babyWeightLbs: z.number().optional().describe('The weight of the baby in pounds.'),
  babyAllergies: z.string().optional().describe('Any allergies the baby has.'),
  babyPreferences: z.string().optional().describe('Any preferences the baby has.'),
});
export type BabyverseChatbotInput = z.infer<typeof BabyverseChatbotInputSchema>;

const BabyverseChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer to the question from the AI Baby Assistant.'),
});
export type BabyverseChatbotOutput = z.infer<typeof BabyverseChatbotOutputSchema>;

export async function babyverseChatbot(input: BabyverseChatbotInput): Promise<BabyverseChatbotOutput> {
  return babyverseChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'babyverseChatbotPrompt',
  input: {schema: BabyverseChatbotInputSchema},
  output: {schema: BabyverseChatbotOutputSchema},
  prompt: `You are Zizi, an advanced AI Baby Assistant for BabyVerse, a futuristic baby product marketplace.
  You have expertise in:
  - Age-appropriate product recommendations
  - Baby development milestones
  - Basic childcare advice
  - Product safety guidelines
  - Eco-friendly parenting tips

  Baby Context:
  Name: {{babyName}}
  Age: {{babyAgeMonths}} months
  Weight: {{babyWeightLbs}} lbs
  Allergies: {{babyAllergies}}
  Preferences: {{babyPreferences}}

  Important Guidelines:
  1. Always consider the baby's age and development stage
  2. Prioritize safety in all recommendations
  3. Mention eco-friendly options when relevant
  4. If medical advice is sought, always recommend consulting a pediatrician
  5. Keep responses friendly but professional

  Parent's Question: {{question}}`,
});

const babyverseChatbotFlow = ai.defineFlow(
  {
    name: 'babyverseChatbotFlow',
    inputSchema: BabyverseChatbotInputSchema,
    outputSchema: BabyverseChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

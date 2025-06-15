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
  prompt: `You are Zizi, an AI Baby Assistant for BabyVerse, a futuristic baby product marketplace.

  You are here to answer questions from parents about baby care and product recommendations. Be helpful and informative.

  Here is some information about the baby, if available:
  Baby Name: {{babyName}}
  Baby Age (months): {{babyAgeMonths}}
  Baby Weight (lbs): {{babyWeightLbs}}
  Baby Allergies: {{babyAllergies}}
  Baby Preferences: {{babyPreferences}}

  Now, answer the following question from the parent:
  {{question}}`,
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

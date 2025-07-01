'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating product descriptions for baby products using AI.
 *
 * - generateProductDescription - A function that generates a product description based on input product details.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product (e.g., diapers, toys, feeding).'),
  productFeatures: z
    .string()
    .describe(
      'A list of features of the product, separated by commas (e.g., Organic cotton, BPA-free, Machine washable).'
    ),
  targetAudience: z
    .string()
    .describe('The target audience for the product (e.g., Newborns, Infants, Toddlers).'),
  keywords: z.string().describe('Relevant keywords to include in the description (e.g., soft, safe, durable).'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  productDescription: z.string().describe('The generated product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in baby products. Generate a compelling and engaging product description based on the following information. The description should be 150-200 words.

Product Name: {{productName}}
Category: {{productCategory}}
Features: {{productFeatures}}
Target Audience: {{targetAudience}}
Keywords: {{keywords}}

Write a description that highlights the benefits of the product, uses persuasive language, and appeals to parents.
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

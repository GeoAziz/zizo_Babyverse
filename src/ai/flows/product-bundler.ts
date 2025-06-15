'use server';

/**
 * @fileOverview Provides AI-driven product recommendations based on baby's profile.
 *
 * - productBundler - A function that generates product bundles based on baby's information.
 * - ProductBundlerInput - The input type for the productBundler function.
 * - ProductBundlerOutput - The return type for the productBundler function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductBundlerInputSchema = z.object({
  babyName: z.string().describe("Baby's name."),
  ageInMonths: z.number().describe("Baby's age in months."),
  weightInKilograms: z.number().describe("Baby's weight in kilograms."),
  allergies: z.string().describe('Comma-separated list of allergies.'),
  preferences: z.string().describe('Baby or parent preferences.'),
});
export type ProductBundlerInput = z.infer<typeof ProductBundlerInputSchema>;

const ProductBundlerOutputSchema = z.object({
  bundleDescription: z
    .string()
    .describe('Description of the recommended product bundle.'),
  productNames: z.array(z.string()).describe('List of product names in the bundle.'),
});
export type ProductBundlerOutput = z.infer<typeof ProductBundlerOutputSchema>;

export async function productBundler(input: ProductBundlerInput): Promise<ProductBundlerOutput> {
  return productBundlerFlow(input);
}

const productBundlerPrompt = ai.definePrompt({
  name: 'productBundlerPrompt',
  input: {schema: ProductBundlerInputSchema},
  output: {schema: ProductBundlerOutputSchema},
  prompt: `You are a baby product expert. Recommend a product bundle based on the following baby information:

Baby Name: {{{babyName}}}
Age (months): {{{ageInMonths}}}
Weight (kg): {{{weightInKilograms}}}
Allergies: {{{allergies}}}
Preferences: {{{preferences}}}

Respond with a bundle description, and a list of product names in the bundle.`,
});

const productBundlerFlow = ai.defineFlow(
  {
    name: 'productBundlerFlow',
    inputSchema: ProductBundlerInputSchema,
    outputSchema: ProductBundlerOutputSchema,
  },
  async input => {
    const {output} = await productBundlerPrompt(input);
    return output!;
  }
);

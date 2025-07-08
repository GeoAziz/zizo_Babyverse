import { z } from 'zod';

const envSchema = z.object({
  // Database
  // DATABASE_URL: z.string(), // <-- Commented out, missing

  // Auth
  NEXTAUTH_URL: z.string(),
  NEXTAUTH_SECRET: z.string(),

  // Payment Processing
  STRIPE_SECRET_KEY: z.string(),
  // STRIPE_WEBHOOK_SECRET: z.string(), // <-- Commented out, missing
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  // PAYPAL_WEBHOOK_ID: z.string(), // <-- Commented out, missing
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Email (SendGrid)
  // SENDGRID_API_KEY: z.string(), // <-- Commented out, missing
  EMAIL_FROM: z.string().optional(),

  // Image Upload (Cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

// Only parse the env if you have all required variables
export const env = envSchema.partial().parse(process.env);
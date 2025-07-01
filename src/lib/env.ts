import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string(),

  // Auth
  NEXTAUTH_URL: z.string(),
  NEXTAUTH_SECRET: z.string(),

  // Payment Processing
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PAYPAL_WEBHOOK_ID: z.string(),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),  // Email (SendGrid)
  SENDGRID_API_KEY: z.string(),
  EMAIL_FROM: z.string().optional(),

  // Image Upload (Cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
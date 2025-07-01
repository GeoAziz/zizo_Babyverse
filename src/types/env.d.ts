declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    PAYPAL_WEBHOOK_ID: string;
    PAYPAL_MODE: 'sandbox' | 'live';
    REDIS_URL: string;
    SENDGRID_API_KEY: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
  }
}
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ClientLayout from '@/components/layout/ClientLayout';
import Providers from './providers'; // Import the new Providers component
import { AuthProvider } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import SplashScreenGate from '@/components/layout/SplashScreenGate';
import { CartProvider } from '@/context/cart-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "Zizo's BabyVerse",
  description: 'A fully immersive, AI-enhanced, futuristic baby product marketplace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn(
        `min-h-screen bg-background font-sans antialiased`,
        inter.variable,
        spaceGrotesk.variable
      )}>
        <SplashScreenGate>
          <Providers> {/* Wrap ClientLayout with Providers */}
            <AuthProvider>
              <CartProvider>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </CartProvider>
            </AuthProvider>
          </Providers>
        </SplashScreenGate>
        <Toaster />
      </body>
    </html>
  );
}

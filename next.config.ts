
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // REMOVED: output: 'export', // No longer doing static export for Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // REMOVED: unoptimized: true, // Allow Vercel to handle image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // If you use other external image sources, add their patterns here
    ],
  },
};

export default nextConfig;

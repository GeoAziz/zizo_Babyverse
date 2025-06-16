
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // output: 'export', // REMOVED: No longer doing static export
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // unoptimized: true, // REMOVED: Allow App Hosting to potentially handle optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

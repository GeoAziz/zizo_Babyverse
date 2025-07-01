/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['placehold.co'],
  },
  trailingSlash: true,
  distDir: '.next',
  typescript: {
    // ⚠️ Use this with caution in production
    ignoreBuildErrors: true
  },
  experimental: {
    optimizeCss: false, // Disable optimizeCss until critters is properly configured
    largePageDataBytes: 128 * 100000, // Increase allowed page data size
    esmExternals: true, // Enable ESM externals
    serverActions: {
      bodySizeLimit: '2mb' // Increase server action payload limit
    },
    turbo: {
      rules: {
        // Fix font loading issues in Turbopack
        '*.woff2': {
          loaders: ['@turbo/loader-font'],
          as: 'font'
        }
      }
    }
  },
  poweredByHeader: false,
  compress: true,  webpack: (config, { isServer }) => {
    // Handle HandlebarsJS warnings
    config.resolve.alias.handlebars = 'handlebars/dist/handlebars.min.js';
    
    // Ignore specific modules that cause warnings
    config.ignoreWarnings = [
      { module: /@opentelemetry/ },
      { module: /handlebars/ }
    ];

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
        os: false,
      };
    }

    // Add source maps for better debugging
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'eval-source-map';
    }

    return config;
  },
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  }
};

module.exports = nextConfig;
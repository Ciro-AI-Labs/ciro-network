/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip TypeScript checking during build (temporarily)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (temporarily)
    ignoreDuringBuilds: true,
  },
  // Skip static optimization for API routes
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'date-fns'],
  },
  // Skip prerendering of API routes
  output: 'standalone',
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      if (!dev && !isServer) {
        const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')()
        config.plugins.push(new BundleAnalyzerPlugin())
      }
      return config
    },
  }),
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY,
    NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID,
  },
  images: {
    domains: ['*'],
    unoptimized: true,
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  // Disable server-side features when exporting
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;

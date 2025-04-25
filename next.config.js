const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://rx-manager-backend-193388977136.us-central1.run.app',
    NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY,
    NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID,
    NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
    NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
    NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    NEXT_PUBLIC_ANTHROPIC_API_KEY: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env)
        })
      );
    }
    return config;
  },
  images: {
    domains: ['*'],
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
  output: 'standalone',
};

console.log('Environment variables in next.config.js:', {
  NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
  NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
  NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY
});

module.exports = nextConfig; 
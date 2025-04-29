const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
    NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
    NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify({
            ...process.env,
            NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
            NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
            NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY
          })
        })
      );
    }
    // if (!isServer) {
    //   console.log('Environment variables status:', {
    //     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ? 'Set' : 'Not set',
    //     NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY ? 'Set' : 'Not set',
    //     NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY ? 'Set' : 'Not set',
    //     NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY ? 'Set' : 'Not set'
    //   });
    // }
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

module.exports = nextConfig; 
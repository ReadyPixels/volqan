import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', 'localhost:4000'],
    },
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };

    if (!isServer) {
      // Prevent Node.js-only packages from being bundled for the browser.
      // sharp and its dependency detect-libc use child_process / fs which
      // don't exist in a browser context.
      config.resolve.alias = {
        ...config.resolve.alias,
        sharp: false,
        'detect-libc': false,
      };
    }

    return config;
  },
};

export default nextConfig;

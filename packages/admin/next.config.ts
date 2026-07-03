import path from 'path';
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', '@volqan/core'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Restrict to specific Cloudflare image delivery hostnames rather than all **.cloudflare.com
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001'],
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

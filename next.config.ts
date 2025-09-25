import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.amazonaws.com',
          pathname: '/**',
        },
      ],
      
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      minimumCacheTTL: 60,
      // Disable optimization for problematic images
      unoptimized: false,
      // Add retry configuration
      formats: ['image/webp', 'image/avif'],
    },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), fullscreen=(self)',
          }
        ],
      },
    ];
  }
};

export default nextConfig;

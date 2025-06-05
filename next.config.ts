import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)', // Apply to all routes
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // or 'SAMEORIGIN' if needed for iframe on same domain
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';", // Disallow all framing
          },
        ],
      },
    ];
  }
};

export default nextConfig;

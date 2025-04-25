import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'export',  // Tells Next.js to prepare a static export
  // Add any other custom configuration here if needed
  publicRuntimeConfig: {
    backendUrlConfig: process.env.NEXT_PUBLIC_API_BASE_URL_V2
  },
};

export default nextConfig;

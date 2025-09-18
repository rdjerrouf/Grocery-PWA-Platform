import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Add unoptimized for development to bypass some issues
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;

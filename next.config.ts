import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Allow Next.js <Image> to load from external sources used in the app
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;

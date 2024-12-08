import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['assets.aceternity.com', 'images.unsplash.com','gateway.pinata.cloud'],  // Allow Unsplash images
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/Login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

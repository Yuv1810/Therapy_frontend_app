import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '39a6-2405-201-8003-582b-f899-7709-52e3-83ca.ngrok-free.app',
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://34.131.31.125:5500/:path*",
      },
    ];
  },
};

export default nextConfig;
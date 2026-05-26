import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://azar-alb-774975018.us-east-1.elb.amazonaws.com/:path*',
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname),
  },
};


module.exports = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://azar-alb-774975018.us-east-1.elb.amazonaws.com/:path*',
      },
    ]
  },
}

export default nextConfig;
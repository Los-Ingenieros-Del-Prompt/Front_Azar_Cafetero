import type { NextConfig } from "next";

const lobbyOrigin = (process.env.LOBBY_API_ORIGIN ??
  "http://azar-alb-774975018.us-east-1.elb.amazonaws.com").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${lobbyOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

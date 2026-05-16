typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    // Solo activo en desarrollo local
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api-proxy/:path*',
          destination: 'http://localhost:8082/:path*',
        },
      ];
    }
    return [];
  },
};

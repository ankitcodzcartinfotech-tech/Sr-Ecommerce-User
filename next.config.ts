import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://keshrag-backend-l2i7.onrender.com';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '7410',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '7410',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '[::1]',
        port: '7410',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'keshrag-backend-l2i7.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'keshrag-backend-l2i7.onrender.com',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    qualities: [25, 50, 75, 90, 95, 100],
  },
  async rewrites() {
    const baseDest = isProduction ? backendUrl : 'http://127.0.0.1:7410';
    return [
      {
        source: '/api/:path*',
        destination: `${baseDest}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${baseDest}/uploads/:path*`,
      },
      {
        source: '/images/:path*',
        destination: `${baseDest}/images/:path*`,
      }
    ];
  },
};

export default nextConfig;

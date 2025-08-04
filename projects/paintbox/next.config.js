/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  typescript: {
    // Skip TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  // Environment variables that will be inlined at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://paintbox-api.railway.app',
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
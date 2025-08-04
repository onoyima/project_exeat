/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for development to enable API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://attendance.veritas.edu.ng/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

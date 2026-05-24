/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://pos.sakte.id/api/:path*',
      },
    ]
  },
};

export default nextConfig;

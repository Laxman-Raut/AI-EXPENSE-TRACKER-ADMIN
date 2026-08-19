/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ai-expense-backend-veoz.onrender.com/api';
    const targetBase = backendUrl.endsWith('/api')
      ? backendUrl
      : `${backendUrl.replace(/\/$/, '')}/api`;

    return [
      {
        source: '/api/:path*',
        destination: `${targetBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;

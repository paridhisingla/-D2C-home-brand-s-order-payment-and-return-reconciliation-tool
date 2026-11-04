/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/orders',
        permanent: false,
      },
      {
        source: '/order',
        destination: '/orders',
        permanent: false,
      },
      {
        source: '/order-board',
        destination: '/orders',
        permanent: false,
      },
      {
        source: '/orders/setup',
        destination: '/orders/new',
        permanent: false,
      },
      {
        source: '/order/new',
        destination: '/orders/new',
        permanent: false,
      },
      {
        source: '/buyer-portal',
        destination: '/buyer?company=buyer-b-uk',
        permanent: false,
      },
      {
        source: '/review-queue',
        destination: '/review',
        permanent: false,
      },
      {
        source: '/floor',
        destination: '/supervisor',
        permanent: false,
      },
      {
        source: '/supervisor-floor',
        destination: '/supervisor',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/executive',
        permanent: false,
      },
      {
        source: '/home',
        destination: '/',
        permanent: false,
      },
      {
        source: '/portfolio',
        destination: '/',
        permanent: false,
      },
      {
        source: '/Portfolio-Website',
        destination: '/',
        permanent: false,
      },
      {
        source: '/Portfolio-Website/:path*',
        destination: '/:path*',
        permanent: false,
      },
      {
        source: '/portfolio/:path*',
        destination: '/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

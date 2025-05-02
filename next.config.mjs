// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://pizza-backend.fly.dev/pizza/api/:path*",
      },
    ];
  },
};

export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false,
  },
  reactStrictMode: false,
  images: {
    domains: ["res.cloudinary.com"],
  },
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

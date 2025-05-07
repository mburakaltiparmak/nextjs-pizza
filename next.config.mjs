/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false,
  },
  reactStrictMode: false,
  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.optimization.minimizer = config.optimization.minimizer.filter(
      (minimizer) => !minimizer.constructor.name.includes("CssMinimizerPlugin")
    );
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://pizza-backend.fly.dev/api/:path*",
      },
    ];
  },
};

export default nextConfig;

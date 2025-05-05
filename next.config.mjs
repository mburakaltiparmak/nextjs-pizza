/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    // CSS minimizer'ı devre dışı bırak
    config.optimization.minimizer = config.optimization.minimizer.filter(
      (minimizer) => !minimizer.constructor.name.includes("CssMinimizerPlugin")
    );
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://pizza-backend.fly.dev/pizza/api/:path*", // Düzeltildi
      },
    ];
  },
};

export default nextConfig;

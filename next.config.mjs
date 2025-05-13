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
        destination: "http://localhost:8080/pizza/api/:path*",
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: "http://localhost:8080/pizza",
    NEXT_PUBLIC_SUPABASE_URL: "https://nslkxjzddnjpouzkevii.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbGt4anpkZG5qcG91emtldmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDA0MjgsImV4cCI6MjA1ODA3NjQyOH0.DP3uywujLW1JzVBOVi3g5M4LKZ4ZzwqtQIGgmWFdMms",
  },
};

export default nextConfig;
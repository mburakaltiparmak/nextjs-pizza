import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      // HTTP protokolü için de izin ekleyin
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    // Alias configuration
    config.resolve.alias['@'] = path.join(process.cwd(), 'src');

    // CSS minimizer'ı devre dışı bırak
    config.optimization.minimizer = config.optimization.minimizer.filter(
      (minimizer) => !minimizer.constructor.name.includes("CssMinimizerPlugin")
    );
    return config;
  },
  async rewrites() {
    // API_BASE_URL'in tanımlı olup olmadığını kontrol et
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // API URL tanımlı ise rewrite kuralı oluştur, değilse boş dizi döndür
    if (apiBaseUrl) {
      return [
        {
          source: "/api/:path*",
          destination: `${apiBaseUrl}/api/:path*`,
        },
      ];
    } else {
      console.warn("NEXT_PUBLIC_API_BASE_URL ortam değişkeni tanımlanmamış! API proxy rewrite'ları devre dışı bırakılıyor.");
      return [];
    }
  },
};

export default nextConfig;
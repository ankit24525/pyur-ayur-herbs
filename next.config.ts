import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable response compression (Brotli / Gzip)
  compress: true,

  // Aggressive Image Optimization & CDN Caching
  images: {
    formats: ["image/avif", "image/webp"], // Serve modern AVIF (smallest) and WebP formats
    minimumCacheTTL: 31536000, // 1 year CDN cache for images (prevents origin re-fetches)
    deviceSizes: [640, 750, 828, 1080, 1200], // Restrict device image breakpoints to prevent oversized images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "kapiva-cdn.gumlet.io",
      },
      {
        protocol: "https",
        hostname: "kapiva-gcp.gumlet.io",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Long-Term CDN Caching Headers for Public Static Assets & Images
  async headers() {
    return [
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

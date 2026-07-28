import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output để Docker image nhỏ gọn
  output: "standalone",

  images: {
    domains: ["localhost"],
    // Nếu dùng Cloudinary/S3 sau này, thêm vào đây
  },

  // Tắt strict mode trong dev nếu cần (khuyến nghị để true)
  reactStrictMode: true,

  // Experimental features (tùy chọn)
  experimental: {
    // Tối ưu package imports cho lucide-react
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

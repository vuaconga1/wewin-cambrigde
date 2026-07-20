import type { NextConfig } from "next";

/** Parent portals allowed to embed WeWIN games via iframe */
const FRAME_ANCESTORS = [
  "'self'",
  "https://wewin.baobai.edu.vn",
  // Bản copy đang test chạy trên Google Apps Script (nội dung render trong iframe
  // của Google). Cho phép các domain này để nhúng iframe khi test trên GAS.
  "https://script.google.com",
  "https://*.googleusercontent.com",
  "http://localhost:*",
  "http://127.0.0.1:*",
].join(" ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wewin.edu.vn",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "example.com", // 👈 thêm dòng này
        pathname: "/images/**",
      },
    ],
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: "/assets/levels/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${FRAME_ANCESTORS}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ["192.168.0.129"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "example.com",
            },
            {
                protocol: "http",
                hostname: "example.com",
            },
        ],
    },
};

export default nextConfig;
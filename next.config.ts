import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    allowedDevOrigins: ['192.168.0.129'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'example.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            }
        ]
    }
};

export default nextConfig;

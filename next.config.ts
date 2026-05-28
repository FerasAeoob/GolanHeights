import type { NextConfig } from "next";

const allowedOrigins = [
    "localhost:3000",
    "192.168.0.134:3000",
    "192.168.0.129:3000",
    "golanwiki.com",
    "www.golanwiki.com",
];

const allowedDevOrigins = [
    "localhost",
    "192.168.0.134",
    "192.168.0.129",
];

if (process.env.APP_URL) {
    try {
        const url = new URL(process.env.APP_URL);
        if (url.host && !allowedOrigins.includes(url.host)) {
            allowedOrigins.push(url.host);
        }
        if (url.hostname && !allowedDevOrigins.includes(url.hostname)) {
            allowedDevOrigins.push(url.hostname);
        }
    } catch {
        // ignore
    }
}

const nextConfig: NextConfig = {
    allowedDevOrigins,
    experimental: {
        serverActions: {
            allowedOrigins,
        },
    },
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'golanwiki.com',
                    },
                ],
                destination: 'https://www.golanwiki.com/:path*',
                permanent: true,
            },
            {
                source: '/:path*',
                has: [
                    {
                        type: 'header',
                        key: 'x-forwarded-proto',
                        value: 'http',
                    },
                    {
                        type: 'host',
                        value: 'www.golanwiki.com',
                    }
                ],
                destination: 'https://www.golanwiki.com/:path*',
                permanent: true,
            }
        ];
    },
    poweredByHeader: false,

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
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=()",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eu.i.posthog.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://res.cloudinary.com https://images.unsplash.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://unpkg.com data: blob:; connect-src 'self' https://eu.i.posthog.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
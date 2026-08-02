import type { MetadataRoute } from 'next';

const baseUrl = 'https://www.golanwiki.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/area-51-sec/',
                '/login',
                '/signup',
                '/favorites',
                '/rewards',
                '/my-coupons',
                '/profile',
                '/dashboard',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

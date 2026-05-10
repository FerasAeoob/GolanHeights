import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: [
                '/',
                '/places',
                '/ar',
                '/ar/places',
                '/he',
                '/he/places'
            ],
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
                '/dashboard'
            ],
        },
        sitemap: 'https://www.golanwiki.com/sitemap.xml',
    };
}

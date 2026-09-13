import type { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Place from '@/database/place.model';
import { SlugSchema } from '@/database/place.schema';
import { locales } from '@/lib/get-dictionary';
import { getLocalizedPathname } from '@/utils/navigation';

const baseUrl = 'https://www.golanwiki.com';

type PlaceForSitemap = {
    slug?: {
        en?: string;
        ar?: string;
        he?: string;
    };
    updatedAt?: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const publicPaths = [
        '/', '/places', '/about', '/history', '/contact', '/cherry-picking',
        '/privacy-policy', '/terms-of-use', '/cookie-policy',
    ];
    const routes: MetadataRoute.Sitemap = publicPaths.flatMap((path) =>
        locales.map((locale) => ({
            url: `${baseUrl}${getLocalizedPathname(path, locale, '', '')}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: path === '/' ? (locale === 'en' ? 1 : 0.8) : path === '/places' ? 0.9 : 0.7,
        })),
    );
    const urls = new Set(routes.map((route) => route.url));

    try {
        await connectDB();

        const places = await Place.find({ hidden: { $ne: true } })
            .select('slug updatedAt')
            .lean<PlaceForSitemap[]>();

        places.forEach((place) => {
            const lastModified = place.updatedAt || now;

            for (const locale of locales) {
                // Match the detail page's preferred localized slug and English fallback.
                const slug = place.slug?.[locale] || place.slug?.en;
                const parsedSlug = SlugSchema.safeParse({ slug });
                if (!parsedSlug.success) continue;
                const url = `${baseUrl}${getLocalizedPathname(`/places/${encodeURIComponent(parsedSlug.data.slug)}`, locale, '', '')}`;
                if (urls.has(url)) continue;
                urls.add(url);
                routes.push({
                    url,
                    lastModified,
                    changeFrequency: 'monthly',
                    priority: 0.8,
                });
            }
        });
    } catch (error) {
        console.error('Failed to fetch places for sitemap:', error);
    }

    return routes;
}

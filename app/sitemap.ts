import type { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Place from '@/database/place.model';

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

    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/places`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/ar`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/ar/places`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/he`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/he/places`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];

    try {
        await connectDB();

        const places = await Place.find({ hidden: { $ne: true } })
            .select('slug updatedAt')
            .lean<PlaceForSitemap[]>();

        places.forEach((place) => {
            const lastModified = place.updatedAt || now;

            if (place.slug?.en) {
                routes.push({
                    url: `${baseUrl}/places/${place.slug.en}`,
                    lastModified,
                    changeFrequency: 'monthly',
                    priority: 0.8,
                });
            }

            if (place.slug?.ar) {
                routes.push({
                    url: `${baseUrl}/ar/places/${place.slug.ar}`,
                    lastModified,
                    changeFrequency: 'monthly',
                    priority: 0.8,
                });
            }

            if (place.slug?.he) {
                routes.push({
                    url: `${baseUrl}/he/places/${place.slug.he}`,
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

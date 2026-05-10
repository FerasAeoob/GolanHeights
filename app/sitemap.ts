import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Place from '@/database/place.model';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://golanwiki.com';

    const routes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/places`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/ar`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/ar/places`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/he`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/he/places`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];

    try {
        await connectDB();
        
        // Fetch published/public places
        const places = await Place.find({})
            .select('slug updatedAt')
            .lean();

        places.forEach((place: any) => {
            // English/default
            if (place.slug?.en) {
                routes.push({
                    url: `${baseUrl}/places/${place.slug.en}`,
                    lastModified: place.updatedAt || new Date(),
                    changeFrequency: 'monthly',
                    priority: 0.8,
                });
            }
            // Arabic
            if (place.slug?.ar) {
                routes.push({
                    url: `${baseUrl}/ar/places/${place.slug.ar}`,
                    lastModified: place.updatedAt || new Date(),
                    changeFrequency: 'monthly',
                    priority: 0.8,
                });
            }
            // Hebrew
            if (place.slug?.he) {
                routes.push({
                    url: `${baseUrl}/he/places/${place.slug.he}`,
                    lastModified: place.updatedAt || new Date(),
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

import Link from "next/link";
import Image from "next/image";

interface PlaceCardProps {
    place: {
        _id?: string; // Added for when you map over the MongoDB array
        title: { en: string; he?: string; ar?: string };
        slug: string;
        description: { en: string; he?: string; ar?: string };
        shortDescription: { en: string; he?: string; ar?: string };
        category: "nature" | "restaurant" | "activity" | "hotel" | "viewpoint";
        image: string;
        location: { lat: number; lng: number };
        contact?: { phone?: string; website?: string; instagram?: string };
        featured: boolean;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    }
    locale?: "en" | "he" | "ar"
}

export default function PlaceCard({ place, locale = "en" }: PlaceCardProps) {
    // Mapping categories to specific colors from your schema enum
    const categoryColors: Record<string, string> = {
        nature: "from-green-900/80",
        restaurant: "from-orange-900/80",
        activity: "from-blue-900/80",
        hotel: "from-indigo-900/80",
        viewpoint: "from-purple-900/80",
    };

    const displayTitle = place.title[locale] || place.title.en;
    const displayShortDesc = place.shortDescription[locale] || place.shortDescription.en;
    const overlayColor = categoryColors[place.category] || "from-slate-900/80";

    return (
        <Link href={`/places/${place.slug}`} className="block w-full">
            {/* FIX: 'aspect-square' prevents vertical stretching.
               'max-w-[380px]' ensures it doesn't get too wide on Desktop.
            */}
            <div className="group relative aspect-square w-full max-w-100 mx-auto overflow-hidden rounded-2xl shadow-md transition-all duration-500 hover:shadow-2xl">

                <Image
                    src={place.image}
                    alt={place.title.en}
                    fill
                    /* 2. Changed 'hover:' to 'group-hover:' so the zoom works through the layers */
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />


                {/* Gradient Overlay using the Category Color */}
                <div className={`absolute inset-0 bg-linear-to-t ${overlayColor} via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90 pointer-events-none`} />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 pointer-events-none">

                    <div className="transform transition-all duration-300 group-hover:-translate-y-2">
                        {/* Category Badge */}
                        <span className="inline-block px-2 py-0.5 mb-2 text-[10px] uppercase tracking-widest text-white bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                            {place.category}
                        </span>

                        <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                            {displayTitle}
                        </h3>

                        {/* Using your shortDescription schema field */}
                        <p className="text-white/90 text-xs mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                            {displayShortDesc}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
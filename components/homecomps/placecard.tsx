import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

interface PlaceCardProps {
    place: {
        _id?: string; // Added for when you map over the MongoDB array
        title: { en: string; he?: string; ar?: string };
        slug: string;
        description: { en: string; he?: string; ar?: string };
        shortDescription: { en: string; he?: string; ar?: string };
        category: "nature" | "restaurant" | "activity" | "hotel" | "viewpoint";
        image: string;
        location: { lat: number; lng: number; name: string };
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
        nature: "bg-green-700/95 hover:bg-black/70",
        restaurant: "bg-orange-900/80",
        activity: "bg-blue-900/80 hover:bg-black-900/40",
        hotel: "bg-indigo-900/80",
        viewpoint: "bg-purple-900/80",
    };

    const displayTitle = place.title[locale] || place.title.en;
    const displayShortDesc = place.shortDescription[locale] || place.shortDescription.en;
    const overlayColor = categoryColors[place.category] || "from-slate-900/80";
    function capitalizeFirst(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return (
        <Link href={`/places/${place.slug}`} className="block w-full">
            {/* FIX: 'aspect-square' prevents vertical stretching.
               'max-w-[380px]' ensures it doesn't get too wide on Desktop.
            */}
            <div className="group z-10 flex relative  h-80 w-full mx-auto overflow-hidden rounded-2xl shadow-md transition-all duration-500 hover:shadow-2xl">

                <Image
                    src={place.image}
                    alt={place.title.en}
                    fill
                    /* 2. Changed 'hover:' to 'group-hover:' so the zoom works through the layers */
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <div className={`absolute z-10 top-4 left-4 text-sm text-white ${categoryColors[place.category]} px-1 rounded-md`}>{capitalizeFirst(place.category)}</div>
                <div className="flex flex-col z-10 mt-auto bg-gray-100 h-[8rem] w-full p-4">
                    <h3 className="group-hover:text-green-800 text-l font-bold ">{displayTitle}</h3>
                    <div className="flex my-1">
                        <MapPin className="w-4 h-4 mt-1 mr-2" />
                        <h1>{place.location.name}</h1>


                    </div>
                    <p className=" text-l ">{displayShortDesc}</p>
                </div>


                {/* Gradient Overlay using the Category Color */}


                {/* Content Overlay */}

            </div>
        </Link>
    );
}
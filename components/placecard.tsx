import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import { IPlaceSerializable } from "@/database/place.model";

interface PlaceCardProps {
    place: IPlaceSerializable
    locale?: "en" | "he" | "ar"
    dict: Record<string, any>
}


export default function PlaceCard({ place, locale = "en", dict }: PlaceCardProps) {
    // Mapping categories to specific colors from your schema enum
    const categoryColors: Record<string, string> = {
        nature: "bg-green-200/90 hover:bg-black/70 text-green-700",
        "food-drink": "bg-orange-200/90 hover:bg-black/70 text-orange-700",
        activities: "bg-blue-200/90 hover:bg-black/70 text-blue-700",
        stays: "bg-indigo-200/90 hover:bg-black/70 text-indigo-700",
        "scenic-spots": "bg-purple-200/90 hover:bg-black/70 text-purple-700",
    };
    const mainImage = place.images?.[0];

    const displayTitle = place.title[locale] || place.title.en;
    const displayShortDesc = place.shortDescription[locale] || place.shortDescription.en;
    function capitalizeFirst(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return (
        <Link href={`/${locale}/places/${place.slug?.[locale] || place.slug.en}`} className="block w-full">
            {/* FIX: 'aspect-square' prevents vertical stretching.
               'max-w-[380px]' ensures it doesn't get too wide on Desktop.
            */}
            <div className="group z-10 flex relative h-100 sm:h-80 w-full mx-auto overflow-hidden rounded-2xl shadow-md transition-all duration-500 hover:shadow-2xl">

                <div className="absolute top-0 left-0 right-0 bottom-40 sm:bottom-32">
                    <Image
                        src={mainImage?.url || "/placeholder.jpg"}
                        alt={mainImage?.alt?.[locale] || place.title.en}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                </div>
                <div className={`absolute z-10 top-4 start-4 text-sm font-bold px-1.5  ${categoryColors[place.category]}  rounded-md`}>
                    {dict.categories[place.category] || capitalizeFirst(place.category)}
                </div>

                <div className="mt-auto z-20 w-full h-40 sm:h-32 p-4 bg-gray-100 flex flex-col ">
                    {place.reviewsCount > 0 && (
                        <div className="flex items-center gap-1 -ms-2 -mt-7 bg-gray-100 w-fit px-2 pt-1 rounded-full">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                            <span className="text-sm font-medium">
                                {(place.averageRating || 0).toFixed(1)}
                            </span>

                            <span className="text-xs text-gray-500">
                                ({place.reviewsCount})
                            </span>
                        </div>
                    )}

                    <h3 className="group-hover:text-green-800 text-l font-bold line-clamp-1">{displayTitle}</h3>
                    <div className="flex my-1 gap-2 ">
                        <MapPin className="w-4 h-4 mt-1 " />
                        <h1 className="line-clamp-1">{place.location.name[locale] || place.location.name.en}</h1>


                    </div>
                    <p className=" text-l line-clamp-3">{displayShortDesc}</p>
                </div>


                {/* Gradient Overlay using the Category Color */}


                {/* Content Overlay */}

            </div>
        </Link>
    );
}

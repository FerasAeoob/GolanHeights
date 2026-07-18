import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { IOpeningHoursDictionary } from "@/lib/types";
import categories from "@/lib/categories";
import { IPublicPlaceDTO } from "@/database/place.model";
import OpenStatus from "./openStatus";
import FavoriteButton from "../favorites/Favorite.button";

interface PlaceCardProps {
    place: IPublicPlaceDTO;
    locale?: "en" | "he" | "ar";
    dict: Record<string, any>;
    /** Pass from the parent page — avoids one DB query per card */
    currentUserId?: string;
    initialIsFavorite?: boolean;
}

export default function PlaceCard({
    place,
    locale = "en",
    dict,
    currentUserId,
    initialIsFavorite = false,
}: PlaceCardProps) {
    const isRTL = locale === 'ar' || locale === 'he';
    const categoryColors: Record<string, string> = {
        nature: "bg-green-200/90 hover:bg-black/70 text-green-700",
        "food-drink": "bg-orange-200/90 hover:bg-black/70 text-orange-700",
        activities: "bg-blue-200/90 hover:bg-black/70 text-blue-700",
        stays: "bg-indigo-200/90 hover:bg-black/70 text-indigo-700",
        "holy-places": "bg-amber-200/90 hover:bg-black/70 text-amber-700",
        "shopping": "bg-pink-200/90 hover:bg-black/70 text-pink-700",
        "local-services": "bg-blue-200/90 hover:bg-black/70 text-blue-700",
    };
    const category = categories.find(cat => cat.slug === place.category);
    const CategoryIcon = category?.icon;
    const mainImage = place.images?.[0];
    const openingHoursDict: IOpeningHoursDictionary = dict.openingHours;
    const displayTitle = place.title[locale] || place.title.en;
    const displayShortDesc = place.shortDescription[locale] || place.shortDescription.en;
    function capitalizeFirst(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return (
        <Link href={`/${locale}/places/${place.slug?.[locale]}`} className="block w-full">
            {/* FIX: 'aspect-square' prevents vertical stretching.
               'max-w-[380px]' ensures it doesn't get too wide on Desktop.
            */}
            <div className="group relative z-10 mx-auto flex h-100 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">

                <div className="absolute top-0 left-0 right-0 bottom-40 sm:bottom-35">
                    <Image
                        src={mainImage?.url || "/placeholder.jpg"}
                        alt={mainImage?.alt?.[locale] || place.title.en}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                </div>
                <div
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`absolute z-10 gap-1 font-bold px-2 top-2 ${isRTL ? "right-2" : "left-2"} text-[14px] h-7 flex items-center !bg-black/20 backdrop-blur-sm !text-white !border-white/40 shadow-inner shadow-black !border-1 justify-center ${categoryColors[place.category]}  rounded-md `}
                >
                    {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5 -mt-[1px] " />}
                    {dict.categories[place.category] || capitalizeFirst(place.category)}
                </div>

                <div className="z-20 mt-auto flex h-40 w-full flex-col border-t border-slate-100 bg-white p-4 sm:h-35">

                    {place.openHours.length > 0 &&
                        <div
                            dir={isRTL ? "rtl" : "ltr"}
                            className="flex items-center -mt-7.5 -ms-1 h-fit gap-1 justify-between"
                        >
                            <div className="flex items-center gap-1 ">

                                <OpenStatus
                                    openingHours={place.openHours || []}
                                    openString={place.open}
                                    dict={openingHoursDict}
                                    textordot="status"

                                />

                                {place.reviewsCount > 0 && (
                                    <div className="flex items-center justify-center gap-1  bg-yellow-50  px-2 border-yellow-200 border-1  rounded-md h-7  ">
                                        <Star className="h-3 w-3 -mt-[1px] fill-yellow-400 text-yellow-400 " />

                                        <span className="text-[14px] font-medium ">
                                            {(place.averageRating || 0).toFixed(1)}
                                        </span>

                                        <span className="text-[14px] text-gray-600 ">
                                            ({place.reviewsCount})
                                        </span>
                                    </div>
                                )}
                            </div>
                            <FavoriteButton
                                placeId={place._id.toString()}
                                currentUserId={currentUserId}
                                initialIsFavorite={initialIsFavorite}
                                dict={dict}
                                lang={locale}
                            />


                        </div>}
                    <div className="mt-1 flex flex-col gap-2 flex-1 min-h-0" dir={isRTL ? "rtl" : "ltr"}>
                        <h3 className="line-clamp-1 text-lg font-extrabold text-slate-950 transition-colors group-hover:text-emerald-800">
                            {displayTitle}
                        </h3>

                        <div className="flex items-center gap-1 font-bold text-emerald-700">
                            <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                            <span className="line-clamp-1">
                                {place.location.name[locale] || place.location.name.en}
                            </span>
                        </div>

                        {/* This will take remaining space and center text */}
                        <div className="flex items-center flex-1 min-h-0">
                            <p className="line-clamp-3 text-[15px] leading-6 text-slate-600 md:line-clamp-2">
                                {displayShortDesc}
                            </p>
                        </div>
                    </div>
                </div>


                {/* Gradient Overlay using the Category Color */}


                {/* Content Overlay */}

            </div>
        </Link>
    );
}

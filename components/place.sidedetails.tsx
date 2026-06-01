import { MapPin, Clock, Hourglass, DollarSign, Phone, LinkIcon, Instagram, Calendar } from "lucide-react";
import { IBusinessDay, IOpeningHoursDictionary } from "@/lib/types";
import OpeningStatus from "./places/openStatus";
import Link from "next/link";

interface PlaceDetailsProps {
    website?: string;
    phone?: string;
    price: string;
    openHours?: IBusinessDay[];
    open?: string;
    mapLink: string;
    duration?: string;
    dict: Record<string, any>;
    instagram?: string;
    instagramHandle?: string;
    bookingLink?: string;
}

export default function PlaceDetails({
    website,
    phone,
    price,
    openHours,
    open,
    mapLink,
    duration,
    dict,
    instagram,
    instagramHandle,
    bookingLink
}: PlaceDetailsProps) {
    const openingHoursDict: IOpeningHoursDictionary = dict.openingHours;

    const rawInstagramHandle = instagramHandle;

    const instagramLabel = rawInstagramHandle?.trim()
        ? rawInstagramHandle.startsWith("@")
            ? rawInstagramHandle
            : `@${rawInstagramHandle}`
        : "Instagram";

    const instagramElement = instagram && (
        <div className="flex items-center gap-3">
            <Instagram className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex flex-col min-w-0">
                <dt className="font-bold text-black/90 text-sm">{dict.instagram || "Instagram"}: </dt>
                <Link 
                    href={instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-emerald-600 hover:underline font-medium truncate block text-left"
                    dir="ltr"
                >
                    {instagramLabel}
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-82 gap-3 border-box hidden lg:flex flex-col h-fit p-5 sticky top-[30dvh] bg-gray-100 rounded-xl drop-shadow-lg overflow-hidden">
                <h1 className="text-xl font-bold mb-3">{dict.details}</h1>

                <dl className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.openhours}: </dt>
                            <dd className="text-black/70">
                                <OpeningStatus
                                    openingHours={openHours}
                                    openString={open}
                                    dict={openingHoursDict}
                                    textordot="text"
                                />
                            </dd>
                        </div>
                    </div>
                    {duration && (
                        <div className="flex items-center gap-3">
                            <Hourglass className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="flex flex-col">
                                <dt className="font-bold text-black/90 text-sm">{dict.duration}: </dt>
                                <dd className="text-black/70">{duration} {dict.minutes}</dd>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.priceLabel}: </dt>
                            <dd className="text-black/70">{dict.price?.[price] || price}</dd>
                        </div>
                    </div>
                    {phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="flex flex-col">
                                <dt className="font-bold text-black/90 text-sm">{dict.phone}: </dt>
                                <Link href={`tel:${phone}`} className="text-emerald-600 hover:underline">
                                    {phone}
                                </Link>
                            </div>
                        </div>
                    )}
                    {website && (
                        <div className="flex items-center gap-3">
                            <LinkIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <dt className="font-bold text-black/90 text-sm">{dict.website}: </dt>
                                <Link 
                                    href={website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-emerald-600 hover:underline truncate block"
                                >
                                    {website}
                                </Link>
                            </div>
                        </div>
                    )}
                    {instagramElement}

                    {(bookingLink || mapLink) && (
                        <div className="flex flex-col gap-2 mt-4">
                            {bookingLink && (
                                <Link
                                    href={bookingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white w-full py-2.5 rounded-md items-center justify-center font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <Calendar className="w-5 h-5 shrink-0" />
                                    {dict.booknow || "Book Now"}
                                </Link>
                            )}

                            <Link
                                href={mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-md items-center justify-center font-semibold"
                            >
                                <MapPin className="w-4 h-4" />
                                {dict.viewonmap}
                            </Link>
                        </div>
                    )}
                </dl>
            </aside>

            {/* Mobile Version */}
            <div className="w-full lg:hidden h-fit border-box flex flex-col rounded-xl drop-shadow-lg bg-gray-100 mt-10 p-5">
                <h1 className="text-xl font-bold mb-3">{dict.details}</h1>

                <dl className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.openhours}: </dt>
                            <dd className="text-black/70">
                                <OpeningStatus
                                    openingHours={openHours}
                                    openString={open}
                                    dict={openingHoursDict}
                                    textordot="text"
                                />
                            </dd>
                        </div>
                    </div>
                    {duration && (
                        <div className="flex items-center gap-3">
                            <Hourglass className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="flex flex-col">
                                <dt className="font-bold text-black/90 text-sm">{dict.duration}: </dt>
                                <dd className="text-black/70">{duration} {dict.minutes}</dd>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.priceLabel}: </dt>
                            <dd className="text-black/70">{dict.price?.[price] || price}</dd>
                        </div>
                    </div>
                    {phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="flex flex-col">
                                <dt className="font-bold text-black/90 text-sm">{dict.phone}: </dt>
                                <Link href={`tel:${phone}`} className="text-emerald-600 hover:underline">
                                    {phone}
                                </Link>
                            </div>
                        </div>
                    )}
                    {website && (
                        <div className="flex items-center gap-3">
                            <LinkIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <dt className="font-bold text-black/90 text-sm">{dict.website}: </dt>
                                <Link 
                                    href={website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-emerald-600 hover:underline truncate block"
                                >
                                    {website}
                                </Link>
                            </div>
                        </div>
                    )}
                    {instagramElement}

                    {(bookingLink || mapLink) && (
                        <div className="flex flex-col gap-2 mt-4">
                            {bookingLink && (
                                <Link
                                    href={bookingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white w-full py-2.5 rounded-md items-center justify-center font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <Calendar className="w-5 h-5 shrink-0" />
                                    {dict.booknow || "Book Now"}
                                </Link>
                            )}

                            <Link
                                href={mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-md items-center justify-center font-semibold"
                            >
                                <MapPin className="w-4 h-4" />
                                {dict.viewonmap}
                            </Link>
                        </div>
                    )}
                </dl>
            </div>
        </>
    );
}
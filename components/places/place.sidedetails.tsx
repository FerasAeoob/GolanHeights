import { MapPin, Clock, Hourglass, DollarSign, Phone, LinkIcon, Instagram, Navigation } from "lucide-react";
import { IBusinessDay, IOpeningHoursDictionary } from "@/lib/types";
import OpeningStatus from "./openStatus";
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
    latitude?: number;
    longitude?: number;
}

const WazeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <title>Waze</title>
        <path d="M13.314 1.59c-.225.003-.45.013-.675.03-2.165.155-4.295.924-6.069 2.327-2.194 1.732-3.296 4.325-3.496 7.05h.002c-.093 1.22-.23 2.15-.469 2.63-.238.479-.42.638-1.24.639C.27 14.259-.4 15.612.266 16.482c1.248 1.657 2.902 2.705 4.72 3.364a2.198 2.198 0 00-.033.367 2.198 2.198 0 002.2 2.197 2.198 2.198 0 002.128-1.668c1.307.12 2.607.14 3.824.1.364-.012.73-.045 1.094-.092a2.198 2.198 0 002.127 1.66 2.198 2.198 0 002.2-2.197 2.198 2.198 0 00-.151-.797 12.155 12.155 0 002.303-1.549c2.094-1.807 3.511-4.399 3.302-7.404-.112-1.723-.761-3.298-1.748-4.608-2.143-2.86-5.53-4.309-8.918-4.265zm.366 1.54c.312.008.623.027.933.063 2.48.288 4.842 1.496 6.4 3.577v.001c.829 1.1 1.355 2.386 1.446 3.792v.003c.173 2.477-.965 4.583-2.777 6.147a10.66 10.66 0 01-2.375 1.535 2.198 2.198 0 00-.98-.234 2.198 2.198 0 00-1.934 1.158 9.894 9.894 0 01-1.338.146 27.323 27.323 0 01-3.971-.148 2.198 2.198 0 00-1.932-1.156 2.198 2.198 0 00-1.347.463c-1.626-.553-3.078-1.422-4.155-2.762 1.052-.096 1.916-.6 2.319-1.408.443-.889.53-1.947.625-3.198v-.002c.175-2.391 1.11-4.536 2.92-5.964h.002c1.77-1.402 3.978-2.061 6.164-2.012zm-3.157 4.638c-.688 0-1.252.579-1.252 1.298 0 .72.564 1.297 1.252 1.297.689 0 1.252-.577 1.252-1.297 0-.711-.563-1.298-1.252-1.298zm5.514 0c-.688 0-1.25.579-1.25 1.298-.008.72.554 1.297 1.25 1.297.688 0 1.252-.577 1.252-1.297 0-.711-.564-1.298-1.252-1.298zM9.641 11.78a.72.72 0 00-.588.32.692.692 0 00-.11.54c.345 1.783 2.175 3.129 4.264 3.129h.125c1.056-.032 2.026-.343 2.816-.922.767-.556 1.29-1.316 1.477-2.137a.746.746 0 00-.094-.547.69.69 0 00-.445-.32.714.714 0 00-.867.539c-.22.93-1.299 1.9-2.934 1.94-1.572.046-2.738-.986-2.926-1.956a.72.72 0 00-.718-.586Z" />
    </svg>
);

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
    latitude,
    longitude
}: PlaceDetailsProps) {
    const openingHoursDict: IOpeningHoursDictionary = dict.openingHours;

    const latNum = typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const lngNum = typeof longitude === "string" ? parseFloat(longitude) : longitude;
    const hasValidCoords = typeof latNum === "number" && typeof lngNum === "number" && !isNaN(latNum) && !isNaN(lngNum);
    const wazeLink = hasValidCoords ? `https://waze.com/ul?ll=${latNum},${lngNum}&navigate=yes` : null;

    const rawInstagramHandle = instagramHandle;

    const instagramLabel = rawInstagramHandle?.trim()
        ? rawInstagramHandle.startsWith("@")
            ? rawInstagramHandle
            : `@${rawInstagramHandle}`
        : (dict.instagram || "Instagram");

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

                    {wazeLink && (
                        <Link
                            href={wazeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-2 bg-[#10a4ef] hover:bg-[#139dec] text-white w-full py-1 mt-3 rounded-md items-center justify-center font-semibold transition-colors duration-200"
                        >
                            <WazeIcon className="w-5 h-5 shrink-0" />
                            {dict.openInWaze || "Open in Waze"}
                        </Link>
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

                    {wazeLink && (
                        <Link
                            href={wazeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-2 bg-[#33CCFF] hover:bg-[#00B2FF] text-white w-full py-1 mt-3 rounded-md items-center justify-center font-semibold transition-colors duration-200"
                        >
                            <WazeIcon className="w-5 h-5 shrink-0" />
                            {dict.openInWaze || "Open in Waze"}
                        </Link>
                    )}
                </dl>
            </div>
        </>
    );
}
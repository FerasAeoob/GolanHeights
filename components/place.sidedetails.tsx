
import { MapPin, Clock, Hourglass, DollarSign, Phone, LinkIcon } from "lucide-react";
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
}: PlaceDetailsProps) {
    const openingHoursDict: IOpeningHoursDictionary = dict.openingHours;
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-82 gap-3 border-box hidden lg:flex flex-col h-fit p-5 sticky top-[30dvh] bg-gray-100 rounded-xl drop-shadow-lg overflow-hidden">

                <h1 className="text-xl font-bold mb-3">{dict.details}</h1>


                <dl className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-600" />
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
                    {duration && <div className="flex items-center gap-3">
                        <Hourglass className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.duration}: </dt>
                            <dd className="text-black/70">{duration} {dict.minutes}</dd>
                        </div>
                    </div>}
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.priceLabel}: </dt>
                            <dd className="text-black/70">{price}</dd>
                        </div>
                    </div>
                    {phone && <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.phone}: </dt>
                            <dd className="text-emerald-600 hover:underline">{phone}</dd>
                        </div>
                    </div>}
                    {website && <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.website}: </dt>
                            <Link href={website} className="text-emerald-600 hover:underline">{website}</Link>
                        </div>
                    </div>}


                    <Link
                        href={mapLink}
                        className="flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full py-1 mt-3 rounded-md items-center justify-center"
                    >
                        <MapPin className="w-4 h-4" />
                        {dict.viewonmap}
                    </Link>
                </dl>
            </aside>

            {/* Mobile Version */}
            <div className="w-full lg:hidden h-fit border-box flex flex-col rounded-xl drop-shadow-lg bg-gray-100 mt-10 p-5">
                <h1 className="text-xl font-bold mb-3">{dict.details}</h1>


                <dl className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-600" />
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
                    {duration && <div className="flex items-center gap-3">
                        <Hourglass className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.duration}: </dt>
                            <dd className="text-black/70">{duration}</dd>
                        </div>
                    </div>}
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.priceLabel}: </dt>
                            <dd className="text-black/70">{price}</dd>
                        </div>
                    </div>
                    {phone && <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.phone}: </dt>
                            <dd className="text-emerald-600 hover:underline">{phone}</dd>
                        </div>
                    </div>}
                    {website && <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col">
                            <dt className="font-bold text-black/90 text-sm">{dict.website}: </dt>
                            <Link href={website} className="text-emerald-600 hover:underline">{website}</Link>
                        </div>
                    </div>}


                    <Link
                        href={mapLink}
                        className="flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full py-1 mt-3 rounded-md items-center justify-center"
                    >
                        <MapPin className="w-4 h-4" />
                        {dict.viewonmap}
                    </Link>
                </dl>
            </div>
        </>
    );
}
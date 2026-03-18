'use client';

import Link from "next/link";

interface PlaceDetailsProps {
    location: string;
    category: string;
    price: string;
    mapLink: string;
    duration?: string;

}

export default function PlaceDetails({
    location,
    category,
    price,
    mapLink,
    duration,
}: PlaceDetailsProps) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-70 border-box hidden lg:flex flex-col h-80 p-5 sticky top-[30dvh] pt-6 bg-gray-100 mt-10 rounded-xl drop-shadow-lg overflow-hidden">
                <div className="flex flex-col gap-3">
                    <h1 className="text-xl font-bold mb-3">Details</h1>
                </div>

                <div className="flex flex-col flex-1 justify-between mt-5">
                    <p>Location: {location}</p>
                    <p>Category: {category}</p>
                    <p>Price: {price}</p>
                    {duration && <p>Duration: {duration}</p>}

                    <Link
                        href={mapLink}
                        className="flex bg-emerald-900 text-white w-full py-1 rounded-md items-center justify-center"
                    >
                        See on map
                    </Link>
                </div>
            </aside>

            {/* Mobile Version */}
            <div className="w-full max-w-[450px] lg:hidden h-70 border-box flex flex-col rounded-xl drop-shadow-lg bg-gray-100 mt-10 p-5">
                <div className="flex flex-col gap-3">
                    <h1 className="text-xl font-bold mb-3">Details</h1>
                </div>

                <div className="flex flex-col flex-1 justify-between mt-5">
                    <p>Location: {location}</p>
                    <p>Category: {category}</p>
                    <p>Price: {price}</p>
                    {duration && <p>Duration: {duration}</p>}

                    <Link
                        href={mapLink}
                        className="flex bg-emerald-900 text-white w-full py-1 rounded-md items-center justify-center"
                    >
                        See on map
                    </Link>
                </div>
            </div>
        </>
    );
}
'use client';
import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

export default function CategoryDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("All categories");

    const categories = ['All categories', 'Nature', 'Restaurant', 'Activity', 'Hotel', 'Viewpoint']
    return (
        <div className="relative ">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className=" flex w-48 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 justify-between items-center"
            >
                {selected}
                <ChevronDown />

            </button>
            {isOpen && (
                <div className="absolute start-0 mt-2 w-48 bg-white rounded shadow-lg z-25">
                    {categories.map((cat) => (
                        <Link
                            key={cat}
                            href={cat === "All categories" ? "/places" : `/places?category=${cat}`}
                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"

                            onClick={() => {
                                setIsOpen(false)
                                setSelected(cat)
                            }}


                        >
                            {cat}
                            {selected === cat && <Check size={16} />}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )


}
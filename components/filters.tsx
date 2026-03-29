import Link from "next/link";
import { CATEGORY_SLUGS } from "@/lib/categories";

export default function Filters() {
    const filters = CATEGORY_SLUGS;

    return (
        <div className="flex gap-2 mt-4 flex-wrap">
            {/* Filter buttons */}
            {filters.map((filter) => (
                <Link key={filter} href={`/places?category=${filter}`}>
                    <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                        {filter}
                    </button>
                </Link>
            ))}

            {/* Show all button */}
            <Link href="/places">
                <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                    Show All
                </button>
            </Link>
        </div>
    );
}
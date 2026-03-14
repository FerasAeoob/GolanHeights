import Link from "next/link";

export default function Filters() {
    const filters = ["nature", "restaurant", "activity", "hotel", "viewpoint"];

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
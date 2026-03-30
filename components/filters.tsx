import Link from "next/link";
import { categories } from "@/lib/categories";

export default function Filters() {
    return (
        <div className="flex gap-2 mt-4 flex-wrap">
            {/* Filter buttons */}
            {categories.map((cat) => (
                <Link key={cat.slug} href={`/places?category=${cat.slug}`}>
                    <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                        {cat.label}
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
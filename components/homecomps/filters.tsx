"use client";
import Link from "next/link";

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return <button {...props} />;
};

export default function Filters() {
    const filters = ["nature", "restaurant", "activity", "hotel", "viewpoint"];

    return (
        <div className="flex gap-2 mt-4 flex-wrap">
            {filters.map((filter) => (
                <Link href={`/places?category=${filter}`}>
                    <Button
                        key={filter}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        {filter}
                    </Button>
                </Link>
            ))}
        </div>
    );
}
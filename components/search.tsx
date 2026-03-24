"use client"; // Required because we are using React hooks and user interaction

import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function SearchBar({ placeholder = "Search places, locations, tags..." }: { placeholder?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    function handleSearch(term: string) {
        // Create a new URLSearchParams object based on the current URL parameters
        const params = new URLSearchParams(searchParams);

        if (term) {
            params.set("search", term); // Add the search term to the URL
        } else {
            params.delete("search"); // Remove the param if the input is empty
        }

        // Update the URL without reloading the page
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="relative w-full">
            {/* Search icon */}
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
            </div>

            {/* Input field */}
            <input
                type="text"
                placeholder={placeholder}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("search")?.toString()}
                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
        </div>
    );
}
"use client"; // Required because we are using React hooks and user interaction

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/utils/useDebounce";

export default function SearchBar({ placeholder = "Search places, locations, tags..." }: { placeholder?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const initialSearch = searchParams.get("search")?.toString() || "";
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentSearch = params.get("search") || "";

        // Prevent unnecessary exact-match pushes
        if (debouncedSearch === currentSearch) {
            return;
        }

        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }

        replace(`${pathname}?${params.toString()}`);
    }, [debouncedSearch, pathname, replace, searchParams]);

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
        </div>
    );
}
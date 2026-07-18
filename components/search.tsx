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
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
                <Search aria-hidden="true" className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="search"
                placeholder={placeholder}
                aria-label={placeholder}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 ps-11 pe-4 text-base text-slate-800 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
        </div>
    );
}

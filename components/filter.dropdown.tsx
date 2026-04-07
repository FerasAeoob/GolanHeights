'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

interface DropdownProps {
    title: string;           // Default display label, e.g. "All Categories"
    paramKey: string;        // URL param name, e.g. "category"
    options: string[];       // Translated display labels
    slugs?: string[];        // Optional: URL-safe slugs mapping 1:1 with options
}

export default function FilterDropdown({
    title,
    paramKey,
    options,
    slugs,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Current URL param value (a slug when slugs are provided, otherwise a label)
    const paramValue = searchParams.get(paramKey) || "";

    // Determine the display label for the current selection
    let selectedLabel = options[0]; // default: first option (e.g. "All Categories")
    if (paramValue && slugs) {
        const idx = slugs.findIndex((s) => s.toLowerCase() === paramValue.toLowerCase());
        if (idx >= 0) selectedLabel = options[idx];
    } else if (paramValue) {
        // Fallback: match by option text
        const match = options.find((o) => o.toLowerCase() === paramValue.toLowerCase());
        if (match) selectedLabel = match;
    }

    // close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full px-2 md:px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 justify-between items-center "
            >
                {selectedLabel}
                <ChevronDown className={isOpen ? "rotate-180" : ""} />
            </button>

            {isOpen && (
                <div className="absolute start-0 w-48 bg-white rounded shadow-lg z-50">
                    {options.map((opt, i) => {
                        const params = new URLSearchParams(searchParams.toString());
                        const slug = slugs ? slugs[i] : opt;

                        if (i === 0) {
                            // First option = "All" → remove the param
                            params.delete(paramKey);
                        } else {
                            params.set(paramKey, slug);
                        }

                        return (
                            <Link
                                key={opt}
                                href={`${pathname}?${params.toString()}`}
                                className="flex justify-between px-4 py-2 hover:bg-gray-100"
                                onClick={() => setIsOpen(false)}
                            >
                                {opt}
                                {selectedLabel === opt && <Check size={16} />}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
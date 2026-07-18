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
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setIsOpen(!isOpen)}
                className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-start text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
                <span className="min-w-0 truncate">{selectedLabel}</span>
                <ChevronDown
                    aria-hidden="true"
                    className={"h-5 w-5 shrink-0 transition-transform " + (isOpen ? "rotate-180" : "")}
                />
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className="absolute top-full start-0 z-50 mt-2 w-full min-w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10"
                >
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
                                role="menuitem"
                                href={pathname + "?" + params.toString()}
                                className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                onClick={() => setIsOpen(false)}
                            >
                                <span>{opt}</span>
                                {selectedLabel === opt && (
                                    <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

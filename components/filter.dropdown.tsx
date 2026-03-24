'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

interface DropdownProps {
    title: string;           // "Category" / "Price"
    paramKey: string;        // "category" / "price"
    options: string[];
}

export default function FilterDropdown({
    title,
    paramKey,
    options,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname(); // ADDED
    const selected = searchParams.get(paramKey) || options[0];

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
                className="flex w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 justify-between items-center "
            >
                {selected}
                <ChevronDown className={isOpen ? "rotate-180" : ""} />
            </button>

            {isOpen && (
                <div className="absolute start-0 w-48 bg-white rounded shadow-lg z-50">
                    {options.map((opt) => {
                        const params = new URLSearchParams(searchParams.toString());

                        if (opt === options[0]) {
                            params.delete(paramKey);
                        } else {
                            params.set(paramKey, opt);
                        }

                        return (
                            <Link
                                key={opt}
                                href={`${pathname}?${params.toString()}`}
                                className="flex justify-between px-4 py-2 hover:bg-gray-100"
                                onClick={() => setIsOpen(false)}
                            >
                                {opt}
                                {selected === opt && <Check size={16} />}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
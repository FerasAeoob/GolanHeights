'use client';

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

interface VillageFilterProps {
    options: { label: string; slug: string }[];
}

export default function VillageFilter({ options }: VillageFilterProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentVillagesParam = searchParams.get("villages");
    const currentVillages = currentVillagesParam ? currentVillagesParam.split(",") : [];

    return (
        <div className="w-full overflow-x-auto pb-2 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-2 items-center">
                {options.map((opt) => {
                    const params = new URLSearchParams(searchParams.toString());
                    const isActive = currentVillages.includes(opt.slug);

                    let newVillages = [...currentVillages];
                    if (isActive) {
                        newVillages = newVillages.filter(v => v !== opt.slug);
                    } else {
                        newVillages.push(opt.slug);
                    }

                    if (newVillages.length > 0) {
                        params.set("villages", newVillages.join(","));
                    } else {
                        params.delete("villages");
                    }

                    return (
                        <Link
                            key={opt.slug}
                            href={`${pathname}?${params.toString()}`}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                ? "bg-emerald-800 text-white shadow-md border border-emerald-800"
                                : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-600 hover:text-emerald-700"
                                }`}
                        >
                            {opt.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

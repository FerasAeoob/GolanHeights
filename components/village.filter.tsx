'use client';

import { useEffect, useRef, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

interface VillageFilterProps {
    options: { label: string; slug: string }[];
    label: string;
    allLabel?: string;
}

export default function VillageFilter({ options, label, allLabel }: VillageFilterProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { push } = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hasOverflow, setHasOverflow] = useState(false);

    const currentVillagesParam = searchParams.get("villages");
    const currentVillages = currentVillagesParam ? currentVillagesParam.split(",").filter(Boolean) : [];

    function navigateWithVillages(villages: string[]) {
        const params = new URLSearchParams(searchParams.toString());

        if (villages.length > 0) {
            params.set("villages", villages.join(","));
        } else {
            params.delete("villages");
        }

        const queryString = params.toString();
        push(queryString ? `${pathname}?${queryString}` : pathname);
    }

    const pillBaseClasses =
        "inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2";
    const inactivePillClasses =
        "border-slate-200 bg-white text-slate-600 hover:border-brand-yellow/50 hover:bg-brand-yellow/10 hover:text-brand-blue";
    const activePillClasses =
        "border-brand-yellow bg-brand-yellow text-brand-ink shadow-sm shadow-emerald-950/10 hover:border-brand-yellow-hover hover:bg-brand-yellow-hover active:border-brand-yellow-active active:bg-brand-yellow-active";

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const updateOverflow = () => {
            setHasOverflow(scrollElement.scrollWidth > scrollElement.clientWidth + 1);
        };

        updateOverflow();

        const resizeObserver = new ResizeObserver(updateOverflow);
        resizeObserver.observe(scrollElement);

        return () => resizeObserver.disconnect();
    }, [options.length]);

    return (
        <section
            className="border-t border-slate-100 pt-4"
            aria-labelledby="village-filter-heading"
        >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <h2
                    id="village-filter-heading"
                    className="shrink-0 text-sm font-bold text-slate-700"
                >
                    {label}
                </h2>

                <div className="relative min-w-0 flex-1">
                    {hasOverflow && (
                        <>
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent" />
                        </>
                    )}

                    <div
                        ref={scrollRef}
                        className="overflow-x-auto scroll-smooth overscroll-x-contain px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <div className="flex snap-x snap-mandatory items-center gap-2">
                            {options.map((opt) => {
                                const isActive = currentVillages.includes(opt.slug);

                                return (
                                    <button
                                        key={opt.slug}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => navigateWithVillages(isActive ? [] : [opt.slug])}
                                        className={`${pillBaseClasses} snap-start ${isActive ? activePillClasses : inactivePillClasses}`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface FreeOnlyFilterProps {
    label: string;
}

export default function FreeOnlyFilter({ label }: FreeOnlyFilterProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { push } = useRouter();

    function setFreeOnly(checked: boolean) {
        const params = new URLSearchParams(searchParams.toString());

        if (checked) {
            params.set("price", "free");
        } else {
            params.delete("price");
        }

        const queryString = params.toString();
        push(queryString ? `${pathname}?${queryString}` : pathname);
    }

    return (
        <label className="flex min-h-12 w-full cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-start text-sm font-semibold text-slate-700 transition-colors hover:border-brand-yellow/50 hover:bg-brand-yellow/10 focus-within:ring-2 focus-within:ring-brand-yellow focus-within:ring-offset-2">
            <input
                type="checkbox"
                checked={searchParams.get("price") === "free"}
                onChange={(event) => setFreeOnly(event.currentTarget.checked)}
            />
            <span className="min-w-0">{label}</span>
        </label>
    );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/utils/useDebounce";
import { getLocalizedPathname } from "@/utils/navigation";
import { ADMIN_PLACE_SEARCH_MAX_LENGTH, buildAdminPlaceSearchParams } from "@/lib/admin-place-search";
import type { Dictionary, Locale } from "@/lib/get-dictionary";

export default function AdminPlaceSearch({ lang, labels }: {
    lang: Locale;
    labels: Dictionary["adminPlaceSearch"];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const urlQuery = searchParams.get("search") || "";
    const urlKey = getLocalizedPathname(pathname, lang, searchParams.toString(), "");
    const [value, setValue] = useState(urlQuery);
    const [composing, setComposing] = useState(false);
    const [pending, startTransition] = useTransition();
    const debounced = useDebounce(value, 300);
    const input = useRef<HTMLInputElement>(null);
    const latest = useRef(value);
    const dirty = useRef(false);
    const observedUrl = useRef(urlKey);
    const submitted = useRef(new Set<string>());

    useEffect(() => {
        if (observedUrl.current === urlKey) return;
        observedUrl.current = urlKey;
        if (submitted.current.has(urlKey)) {
            // Discard acknowledged and superseded requests, retaining newer drafts.
            for (const key of submitted.current) {
                submitted.current.delete(key);
                if (key === urlKey) break;
            }
            return;
        }
        // Browser history and external navigation replace the draft; our own
        // responses must never overwrite characters typed while loading.
        submitted.current.clear();
        dirty.current = false;
        latest.current = urlQuery;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize an external navigation with the editable draft
        setValue(urlQuery);
    }, [urlKey, urlQuery]);

    useEffect(() => {
        const onPopState = () => {
            const query = new URLSearchParams(window.location.search).get("search") || "";
            submitted.current.clear();
            dirty.current = false;
            latest.current = query;
            setValue(query);
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    useEffect(() => {
        if (!dirty.current || composing || debounced !== latest.current) return;
        dirty.current = false;
        if (debounced.trim() === urlQuery && submitted.current.size === 0) return;
        const params = buildAdminPlaceSearchParams(searchParams.toString(), debounced);
        submitted.current.add(getLocalizedPathname(pathname, lang, params, ""));
        const href = getLocalizedPathname(pathname, lang, params, window.location.hash);
        startTransition(() => router.replace(href, { scroll: false }));
    }, [debounced, composing, lang, pathname, router, searchParams, urlQuery]);

    function clear() {
        latest.current = "";
        dirty.current = false;
        setValue("");
        setComposing(false);
        const params = buildAdminPlaceSearchParams(searchParams.toString(), "");
        submitted.current.add(getLocalizedPathname(pathname, lang, params, ""));
        startTransition(() => router.replace(getLocalizedPathname(pathname, lang, params, window.location.hash), { scroll: false }));
        input.current?.focus();
    }

    return (
        <div role="search" aria-label={labels.label} className="mb-5">
            <label htmlFor="admin-place-search" className="mb-2 block text-sm font-semibold text-slate-700">{labels.label}</label>
            <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    ref={input}
                    id="admin-place-search"
                    type="search"
                    value={value}
                    maxLength={ADMIN_PLACE_SEARCH_MAX_LENGTH}
                    placeholder={labels.placeholder}
                    autoComplete="off"
                    onChange={event => {
                        latest.current = event.target.value;
                        dirty.current = true;
                        setValue(event.target.value);
                    }}
                    onCompositionStart={() => setComposing(true)}
                    onCompositionEnd={event => {
                        latest.current = event.currentTarget.value;
                        dirty.current = true;
                        setValue(event.currentTarget.value);
                        setComposing(false);
                    }}
                    className="min-h-13 w-full rounded-2xl border border-slate-200 bg-white py-3 ps-12 pe-14 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 [&::-webkit-search-cancel-button]:appearance-none"
                />
                {value && (
                    <button type="button" onClick={clear} aria-label={labels.clear} className="absolute end-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                        <X aria-hidden="true" className="h-5 w-5" />
                    </button>
                )}
            </div>
            <div role="status" aria-live="polite" className="mt-1 min-h-5 text-xs text-slate-500">{pending ? labels.loading : ""}</div>
        </div>
    );
}

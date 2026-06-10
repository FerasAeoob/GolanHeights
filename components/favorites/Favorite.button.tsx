'use client'

import { useState, useEffect, useRef } from "react";
import { Bookmark, X, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FavoriteButtonProps {
    placeId: string;
    currentUserId?: string;
    initialIsFavorite: boolean;
    dict: Record<string, any>;
    lang?: "en" | "ar" | "he";
}

export default function FavoriteButton({
    placeId,
    currentUserId,
    initialIsFavorite,
    dict,
    lang = "en",
}: FavoriteButtonProps) {
    const router = useRouter();
    const isRtl = lang === "ar" || lang === "he";

    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const [showLoginPopover, setShowLoginPopover] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const f = dict?.favorites || {};

    // Auto-dismiss login popover after 4 seconds
    useEffect(() => {
        if (!showLoginPopover) return;
        const t = setTimeout(() => setShowLoginPopover(false), 4000);
        return () => clearTimeout(t);
    }, [showLoginPopover]);

    // Auto-dismiss error after 3 seconds
    useEffect(() => {
        if (!showError) return;
        const t = setTimeout(() => setShowError(false), 3000);
        return () => clearTimeout(t);
    }, [showError]);

    // Close popover on outside click
    useEffect(() => {
        if (!showLoginPopover) return;
        function handleOutside(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setShowLoginPopover(false);
            }
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [showLoginPopover]);

    async function handleToggle(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.blur();

        if (!currentUserId) {
            setShowLoginPopover(true);
            return;
        }

        if (loading) return;

        const wasFavorite = isFavorite;
        const nextIsFavorite = !wasFavorite;

        try {
            setLoading(true);
            setShowError(false);

            setIsFavorite(nextIsFavorite);

            const res = await fetch("/api/users/favorites", {
                method: wasFavorite ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ placeId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setIsFavorite(wasFavorite);
                const code = data.errorCode || "UNKNOWN_ERROR";
                setErrorMsg(dict?.errors?.[code] || dict?.errors?.UNKNOWN_ERROR || "Something went wrong");
                setShowError(true);
                return;
            }

            window.dispatchEvent(
                new CustomEvent("favorite-changed", {
                    detail: { placeId, action: wasFavorite ? "remove" : "add" },
                })
            );

            router.refresh();
        } catch {
            setIsFavorite(wasFavorite);
            setErrorMsg(dict?.errors?.UNKNOWN_ERROR || "Something went wrong");
            setShowError(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative" ref={popoverRef}>
            {/* Favorite toggle button */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={loading}
                aria-label={isFavorite ? (f.remove || "Remove from favorites") : (f.add || "Add to favorites")}
                className={`w-fit h-7 text-[14px] inline-flex items-center gap-1 rounded-md border px-2 py-1 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 focus:outline-none ${
                    isFavorite
                        ? "border-yellow-200 bg-yellow-50 text-yellow-600"
                        : "border-gray-300 bg-white text-gray-700"
                }`}
            >
                <Bookmark
                    className={`h-3.5 w-3.5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                />
            </button>

            {/* Login required popover */}
            {showLoginPopover && (
                <div
                    dir={isRtl ? "rtl" : "ltr"}
                    className="absolute bottom-full mb-2 z-50 w-64 rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 flex flex-col gap-3 end-0"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-900 text-sm leading-snug text-start">
                            {f.favoriteLoginRequiredTitle || "Login required"}
                        </p>
                        <button
                            onClick={() => setShowLoginPopover(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex-shrink-0 bg-slate-50 hover:bg-slate-100 p-1 rounded-md"
                            aria-label={f.favoriteLoginRequiredClose || "Close"}
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Message */}
                    <p className="text-slate-500 text-xs leading-relaxed text-start">
                        {f.favoriteLoginRequiredMessage || "Sign in to save places to your favorites."}
                    </p>

                    {/* Sign in button */}
                    <Link
                        href={lang === 'en' ? '/login' : `/${lang}/login`}
                        onClick={() => setShowLoginPopover(false)}
                        className="flex items-center justify-center gap-1.5 mt-1 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-3 transition-colors shadow-sm"
                    >
                        <LogIn size={14} />
                        {f.favoriteLoginRequiredAction || "Sign in"}
                    </Link>
                </div>
            )}

            {/* Generic error popover */}
            {showError && errorMsg && (
                <div
                    dir={isRtl ? "rtl" : "ltr"}
                    className="absolute bottom-full mb-2 z-50 w-52 rounded-lg border border-red-100 bg-red-50 shadow-md px-3 py-2 text-red-700 text-xs text-start end-0"
                >
                    {errorMsg}
                </div>
            )}
        </div>
    );
}

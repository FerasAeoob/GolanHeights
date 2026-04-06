'use client'

import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"

interface FavoriteButtonProps {
    placeId: string;
    currentUserId?: string;
    initialIsFavorite: boolean;
    dict: Record<string, any>;
}

export default function FavoriteButton({ placeId, currentUserId, initialIsFavorite, dict }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Auto-hide error after 3 seconds
    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => setError(null), 1500);
        return () => clearTimeout(timer);
    }, [error]);

    async function handleToggle(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUserId) {
            setError(dict?.favorites?.loginRequired || "You must be logged in");
            return;
        }

        if (loading) return;

        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/api/users/favorites", {
                method: isFavorite ? "DELETE" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ placeId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to toggle favorite");
            }

            setIsFavorite(!isFavorite);
        } catch (error) {
            setError(dict?.favorites?.error || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative flex flex-col gap-2">
            <button
                type="button"
                onClick={handleToggle}
                disabled={loading}
                className={`w-fit h-7 text-[14px] inline-flex items-center gap-1 rounded-md border px-2 py-1 transition disabled:opacity-50 ${isFavorite
                    ? "border-yellow-200 bg-yellow-50 text-yellow-600"
                    : "border-gray-300 bg-white text-gray-700"
                    }`}
            >
                <Bookmark
                    className={`h-3.5 w-3.5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                />
            </button>

            {error && (
                <div className="absolute end-[calc(100%-31.8px)] top-full mt-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md shadow w-20">
                    {error}
                </div>
            )}
        </div>
    );
}
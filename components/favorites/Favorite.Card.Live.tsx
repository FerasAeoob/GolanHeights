"use client";

import { ReactNode, useEffect, useState } from "react";

interface FavoriteCardLiveItemProps {
    placeId: string;
    children: ReactNode;
}

export default function FavoriteCardLiveItem({
    placeId,
    children,
}: FavoriteCardLiveItemProps) {
    const [visible, setVisible] = useState(true);
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        function handleFavoriteChanged(event: Event) {
            const customEvent = event as CustomEvent<{
                placeId: string;
                action: "add" | "remove";
            }>;

            if (
                customEvent.detail.placeId === placeId &&
                customEvent.detail.action === "remove"
            ) {
                setRemoving(true);

                setTimeout(function () {
                    setVisible(false);
                }, 300);
            }
        }

        window.addEventListener("favorite-changed", handleFavoriteChanged);

        return function () {
            window.removeEventListener("favorite-changed", handleFavoriteChanged);
        };
    }, [placeId]);

    if (!visible) return null;

    return (
        <div
            className={`transition-all duration-300 ease-in-out origin-center ${removing ? "scale-90 opacity-0" : "scale-100 opacity-100"
                }`}
        >
            {children}
        </div>
    );
}
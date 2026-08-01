"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/get-dictionary";
import { logoutFromProfile } from "@/components/profile/profile-logout";

type ProfileLogoutButtonProps = {
    lang: Locale;
    label: string;
    errorMessage: string;
};

export default function ProfileLogoutButton({
    lang,
    label,
    errorMessage,
}: ProfileLogoutButtonProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        if (isPending) return;

        setIsPending(true);
        setError(null);

        try {
            await logoutFromProfile({
                lang,
                request: fetch,
                replace: router.replace,
            });
        } catch {
            setError(errorMessage);
            setIsPending(false);
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                aria-describedby={error ? "profile-logout-error" : undefined}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200/80 text-red-500 hover:bg-red-50 hover:border-red-300 font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
                <LogOut size={16} aria-hidden="true" />
                {label}
            </button>
            {error && (
                <p id="profile-logout-error" role="alert" className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

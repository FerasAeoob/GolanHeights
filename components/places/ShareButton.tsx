"use client";

import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
    title: string;
    label: string;
    copiedLabel: string;
    copyFailedLabel: string;
}

type ShareState = "idle" | "pending" | "copied" | "failed";

export default function ShareButton({
    title,
    label,
    copiedLabel,
    copyFailedLabel,
}: ShareButtonProps) {
    const [state, setState] = useState<ShareState>("idle");
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (feedbackTimer.current) {
                clearTimeout(feedbackTimer.current);
            }
        };
    }, []);

    const showFeedback = (nextState: "copied" | "failed") => {
        if (feedbackTimer.current) {
            clearTimeout(feedbackTimer.current);
        }

        setState(nextState);
        feedbackTimer.current = setTimeout(() => {
            setState("idle");
            feedbackTimer.current = null;
        }, 2000);
    };

    const handleShare = async () => {
        if (state === "pending") {
            return;
        }

        setState("pending");
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                setState("idle");
                return;
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    setState("idle");
                    return;
                }
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            showFeedback("copied");
        } catch {
            showFeedback("failed");
        }
    };

    const buttonLabel = state === "copied"
        ? copiedLabel
        : state === "failed"
            ? copyFailedLabel
            : label;

    return (
        <button
            type="button"
            onClick={handleShare}
            disabled={state === "pending"}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 font-semibold text-emerald-800 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <Share2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span aria-live="polite">{buttonLabel}</span>
        </button>
    );
}

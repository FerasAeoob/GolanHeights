'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

interface BackToExploreProps {
    label: string;
    lang: 'en' | 'ar' | 'he';
    fallbackHref: string;
}

export default function BackToExplore({
    label,
    lang,
    fallbackHref,
}: BackToExploreProps) {
    const router = useRouter();

    function handleBack(event: MouseEvent<HTMLAnchorElement>) {
        if (
            window.history.length > 1 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey
        ) {
            event.preventDefault();
            router.back();
        }
    }

    const isRtl = lang === 'ar' || lang === 'he';

    return (
        <Link
            href={fallbackHref}
            onClick={handleBack}
            className="flex cursor-pointer items-center gap-3 text-lg font-bold transition-colors duration-300 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
            <ArrowLeft
                aria-hidden="true"
                className={`mt-1 ${isRtl ? 'rotate-180' : ''}`}
            />
            {label}
        </Link>
    );
}

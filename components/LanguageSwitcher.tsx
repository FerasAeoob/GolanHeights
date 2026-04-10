'use client';
import { Languages } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();

    const languages = ['en', 'he', 'ar'] as const;

    // split('/') results in ["", "en", "places", "slug"]
    const segments = pathname.split('/');

    // Get the current lang from the URL, fallback to 'en'
    const currentLang = languages.includes(segments[1] as any)
        ? (segments[1] as typeof languages[number])
        : 'en';

    const toggleLanguage = () => {
        const currentIndex = languages.indexOf(currentLang);
        const nextIndex = (currentIndex + 1) % languages.length;
        const nextLang = languages[nextIndex];

        // Create a copy of the segments
        const newSegments = [...segments];

        // 1. Language prefix update
        if (languages.includes(newSegments[1] as any)) {
            newSegments[1] = nextLang;
        } else {
            newSegments.splice(1, 0, nextLang);
        }

        // 2. Localized Slug Handling (Smooth Transition)
        // Check if we are on /[lang]/places/[slug]
        const isPlaceDetail = newSegments[2] === 'places' && newSegments[3];
        if (isPlaceDetail && typeof document !== 'undefined') {
            const el = document.getElementById('place-slugs');
            if (el) {
                const localizedSlug = el.getAttribute('data-' + nextLang);
                if (localizedSlug) {
                    newSegments[3] = localizedSlug;
                }
            }
        }

        const newPath = newSegments.join('/') || '/';
        router.push(newPath);
    };

    return (
        <button
            onClick={toggleLanguage}
            className=" cursor-pointer rounded-md h-[40px] w-[40px] flex items-center justify-center "
        >
            <Languages className="w-5 h-5 text-white" />
        </button>
    );
}

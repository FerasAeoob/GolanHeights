'use client';
import { Globe } from 'lucide-react';
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

        // If the first segment is a known language, replace it.
        // If it's not (e.g., someone is at /places/...), insert the new lang.
        if (languages.includes(newSegments[1] as any)) {
            newSegments[1] = nextLang;
        } else {
            newSegments.splice(1, 0, nextLang);
        }

        const newPath = newSegments.join('/') || '/';
        router.push(newPath);
    };

    const labels = { en: 'EN', he: 'HE', ar: 'AR' };
    const nextLang = languages[(languages.indexOf(currentLang) + 1) % 3];

    return (
        <button
            onClick={toggleLanguage}
            className=" cursor-pointer rounded-full"
        >
            <Globe className="w-7 h-7 text-white bg-emerald-700/80 rounded-full" />
        </button>
    );
}
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import { useLocalizedSlugs } from '@/app/LocalizedSlugContext';
import { getLocalizedPathname, pushPreservingScroll } from '@/utils/navigation';

// ─── Language metadata ────────────────────────────────────────────────────────
const LANGS = ['en', 'he', 'ar'] as const;
type Lang = (typeof LANGS)[number];

const LANG_LABELS: Record<Lang, string> = {
    en: 'English',
    he: 'עברית',
    ar: 'العربية',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { localizedSlugs } = useLocalizedSlugs();

    // Detect current language from the URL
    const segments = pathname.split('/');
    const currentLang: Lang = LANGS.includes(segments[1] as Lang)
        ? (segments[1] as Lang)
        : 'en';

    // ── Close on outside click ────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (e: PointerEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const setLanguageCookie = (lang: Lang) => {
        document.cookie = `preferred_language=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    };

    const switchTo = (lang: Lang) => {
        setIsOpen(false);
        setLanguageCookie(lang);
        if (lang === currentLang) return;
        const newPath = getLocalizedPathname(
            pathname,
            lang,
            typeof window !== 'undefined' ? window.location.search : '',
            typeof window !== 'undefined' ? window.location.hash : '',
            localizedSlugs
        );
        pushPreservingScroll(router, newPath);
    };


    return (
        <div ref={containerRef} className="relative">
            {/* ── Trigger button ── */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Switch language"
                className="
                    flex cursor-pointer items-center gap-1.5
                    rounded-lg border border-white/10
                    bg-white/5 px-3 py-2
                    text-sm font-semibold text-white
                    transition-all duration-150
                    hover:bg-white/10 hover:border-white/20
                    active:scale-[0.97]
                "
            >
                <span className="leading-none">{LANG_LABELS[currentLang]}</span>
                <ChevronDown
                    size={14}
                    className={`shrink-0 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* ── Dropdown panel ── */}
            <div
                role="listbox"
                aria-label="Language options"
                className={`
                    absolute end-0 top-[calc(100%+6px)]
                    w-36 origin-top-right
                    rounded-xl border border-white/10
                    bg-[#1a1a1a] shadow-[0_8px_30px_rgba(0,0,0,0.5)]
                    transition-all duration-200
                    ${isOpen
                        ? 'pointer-events-auto scale-100 opacity-100'
                        : 'pointer-events-none scale-95 opacity-0'
                    }
                    z-[200]
                `}
            >
                <ul className="p-1">
                    {LANGS.map((lang) => {
                        const isActive = lang === currentLang;
                        return (
                            <li key={lang}>
                                <button
                                    role="option"
                                    aria-selected={isActive}
                                    onClick={() => switchTo(lang)}
                                    className={`
                                        flex w-full cursor-pointer items-center justify-between
                                        rounded-lg px-3 py-2.5
                                        text-sm font-medium
                                        transition-colors duration-100
                                        ${isActive
                                            ? 'bg-brand-yellow/15 text-brand-yellow'
                                            : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <span>{LANG_LABELS[lang]}</span>
                                    {isActive && (
                                        <Check size={14} className="shrink-0 text-brand-yellow" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

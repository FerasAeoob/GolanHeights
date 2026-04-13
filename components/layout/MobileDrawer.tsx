'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Home,
    Heart,
    User as UserIcon,
    Bell,
    Languages,
    Mail,
    Info,
    X,
    Menu,
    LogOut,
    LogIn
} from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import { useRouter, usePathname } from 'next/navigation';

interface MobileDrawerProps {
    lang: string;
    dict: Record<string, any>;
    currentUser: any;
}

export default function MobileDrawer({ lang, dict, currentUser }: MobileDrawerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const isRTL = lang === 'he' || lang === 'ar';

    // Toggle drawer
    const toggleDrawer = () => setIsOpen(!isOpen);

    const toggleLanguage = () => {
        const languages = ['en', 'he', 'ar'] as const;
        const currentIndex = languages.indexOf(lang as any);
        const nextIndex = (currentIndex + 1) % languages.length;
        const nextLang = languages[nextIndex];

        // split('/') results in ["", "en", "places", "slug"]
        const segments = pathname.split('/');
        const newSegments = [...segments];

        // 1. Language prefix update
        if (languages.includes(newSegments[1] as any)) {
            newSegments[1] = nextLang;
        } else {
            newSegments.splice(1, 0, nextLang);
        }

        // 2. Localized Slug Handling (Smooth Transition)
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
        setIsOpen(false);
    };

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                router.refresh();
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Close drawer when clicking outside or on specialized keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const items = [
        { label: dict.nav?.home || 'Home', href: `/${lang}`, icon: Home, separator: false },
        { label: dict.nav?.favorites || 'Favorites', href: `/${lang}/favorites`, icon: Heart, separator: !currentUser },
        ...(currentUser
            ? [
                { label: dict.nav?.profile || 'Profile', href: `/${lang}/profile`, icon: UserIcon, separator: false },
                { label: dict.nav?.notifications || 'Notifications', href: `/${lang}/notifications`, icon: Bell, separator: true },
            ]
            : []),
        { label: dict.nav?.language || 'Language', href: '#', icon: Languages, onClick: toggleLanguage, separator: false },
        { label: dict.nav?.contact || 'Contact', href: `/${lang}/contact`, icon: Mail, separator: true },
        { label: dict.nav?.about || 'About', href: `/${lang}/about`, icon: Info, separator: true },
        ...(currentUser
            ? [{ label: dict.auth?.logout || 'Logout', href: '#', icon: LogOut, onClick: handleLogout, separator: false }]
            : [{ label: dict.auth?.login || 'Login', href: `/${lang}/login`, icon: LogIn, separator: false }]),
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={toggleDrawer}
                className="text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Open Menu"
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 bottom-0 h-screen h-[100dvh] w-[300px] bg-[#111111] z-[120] shadow-[10px_0_30px_-5px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out ${isRTL
                    ? (isOpen ? 'translate-x-0 right-0' : 'translate-x-[100%] right-0')
                    : (isOpen ? 'translate-x-0 left-0' : 'translate-x-[-100%] left-0')
                    }`}
            >
                <div className="flex flex-col h-full text-white">
                    {/* Header / User Profile */}
                    <div className="p-6 border-b border-white/5 bg-black/40">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">
                                {dict.nav?.menu || 'Navigation'}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <UserAvatar
                                    src={currentUser?.image}
                                    name={currentUser?.name}
                                    size={60}
                                    className="ring-2 ring-emerald-500/20"
                                />
                                {currentUser && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#111111] rounded-full" />
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-lg truncate leading-tight">
                                    {currentUser?.name || dict.nav?.guest || 'Guest'}
                                </span>
                                <span className="text-xs text-neutral-500 truncate mt-0.5">
                                    {currentUser?.email || (lang === 'en' ? 'Welcome Traveler' : 'ברוכים הבאים')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-6">
                        <ul className="space-y-1 px-4">
                            {items.map((item, index) => {
                                const isAction = !!item.onClick;

                                return (
                                    <li key={index}>
                                        {isAction ? (
                                            <button
                                                onClick={item.onClick}
                                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-all group active:scale-[0.98] text-start"
                                            >
                                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 text-neutral-400 transition-colors">
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="font-semibold text-neutral-200 group-hover:text-white transition-colors">
                                                    {item.label}
                                                </span>
                                            </button>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-all group active:scale-[0.98] text-start"
                                            >
                                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 text-neutral-400 transition-colors">
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="font-semibold text-neutral-200 group-hover:text-white transition-colors">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        )}
                                        {item.separator && (
                                            <div className="h-px bg-white/5 mx-4 my-3" />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>


                    {/* Footer */}
                    <div className="p-8 border-t border-white/5 bg-black/40">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] text-neutral-600 font-bold font-outfit uppercase tracking-widest italic">
                                    Golan Wiki v1.2
                                </span>
                            </div>
                            <span className="text-[10px] text-neutral-700">© 2026</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

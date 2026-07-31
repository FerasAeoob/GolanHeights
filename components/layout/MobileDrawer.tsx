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
    LogIn,
    Shield,
    BookOpen
} from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import { useRouter, usePathname } from 'next/navigation';
import { useLocalizedSlugs } from '@/app/LocalizedSlugContext';
import { getLocalizedPathname, pushPreservingScroll } from '@/utils/navigation';

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
    const { localizedSlugs } = useLocalizedSlugs();

    // Toggle drawer
    const toggleDrawer = () => setIsOpen(!isOpen);

    const toggleLanguage = () => {
        const languages = ['en', 'he', 'ar'] as const;
        const currentIndex = languages.indexOf(lang as any);
        const nextIndex = (currentIndex + 1) % languages.length;
        const nextLang = languages[nextIndex];

        const newPath = getLocalizedPathname(
            pathname,
            nextLang,
            typeof window !== 'undefined' ? window.location.search : '',
            typeof window !== 'undefined' ? window.location.hash : '',
            localizedSlugs
        );
        pushPreservingScroll(router, newPath);
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

    const getLink = (path: string) => {
        if (lang === 'en') return path;
        return path === '/' ? `/${lang}` : `/${lang}${path}`;
    };

    const items = [
        { label: dict.nav?.home || 'Home', href: getLink('/'), icon: Home, separator: false },
        { label: dict.nav?.favorites || 'Favorites', href: getLink('/favorites'), icon: Heart, separator: !currentUser },
        ...(currentUser
            ? [
                { label: dict.nav?.profile || 'Profile', href: getLink('/profile'), icon: UserIcon, separator: false },
                { label: dict.nav?.notifications || 'Notifications', href: getLink('/notifications'), icon: Bell, separator: true },
            ]
            : []),
        ...(currentUser?.role === 'admin'
            ? [
                { label: dict.nav?.adminPanel || 'Admin Panel', href: getLink('/area-51-sec'), icon: Shield, separator: true },
            ]
            : []),

        { label: dict.nav?.history || 'History', href: getLink('/history'), icon: BookOpen, separator: false },
        { label: dict.nav?.contact || 'Contact', href: getLink('/contact'), icon: Mail, separator: true },
        { label: dict.nav?.about || 'About', href: getLink('/about'), icon: Info, separator: true },
        ...(currentUser
            ? [{ label: dict.profile?.logout || 'Logout', href: '#', icon: LogOut, onClick: handleLogout, separator: false }]
            : [{ label: dict.auth?.login || 'Login', href: getLink('/login'), icon: LogIn, separator: false }]),
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={toggleDrawer}
                className="text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label={dict.nav?.openMenu || "Open Menu"}
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
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">
                                {dict.nav?.menu || 'Navigation'}
                            </span>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                aria-label={dict.nav?.closeMenu || "Close Menu"}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {currentUser && (
                            <div className="flex items-center gap-4 mt-8">
                                <div className="relative">
                                    <UserAvatar
                                        src={currentUser.image}
                                        name={currentUser.name}
                                        size={60}
                                        className="ring-2 ring-brand-yellow/20"
                                    />

                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#111111] rounded-full" />
                                </div>

                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold text-lg truncate leading-tight">
                                        {currentUser.name}
                                    </span>

                                    <span className="text-xs text-neutral-500 truncate mt-0.5">
                                        {currentUser.email}
                                    </span>
                                </div>
                            </div>
                        )}
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
                                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-brand-yellow/10 group-hover:text-brand-yellow text-neutral-400 transition-colors">
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
                                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-brand-yellow/10 group-hover:text-brand-yellow text-neutral-400 transition-colors">
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
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] text-neutral-600 font-bold font-outfit uppercase tracking-widest italic">
                                    Golan Wiki v1.0
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

'use client';
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import MobileDrawer from "@/components/layout/MobileDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
    getNextNavbarScrollState,
    type NavbarScrollState,
} from "@/components/navbar-scroll";
import type { NavbarDictionary, NavbarUser } from "@/components/navbar.types";


export default function Navbar({ lang, dict, currentUser }: { lang: string; dict: NavbarDictionary; currentUser: NavbarUser }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
    const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
    const visibilityRef = useRef(true);
    const pinSourcesRef = useRef({ mobileMenu: false, languageSelector: false, keyboardFocus: false });
    const scrollStateRef = useRef<NavbarScrollState>({
        isVisible: true,
        previousScrollY: 0,
        accumulatedDelta: 0,
    });
    const mustStayVisible = isMobileMenuOpen || isLanguageSelectorOpen || hasKeyboardFocus;
    const mustStayVisibleRef = useRef(false);

    const showNavbar = useCallback(() => {
        const scrollY = Math.max(0, window.scrollY);
        scrollStateRef.current = {
            isVisible: true,
            previousScrollY: scrollY,
            accumulatedDelta: 0,
        };

        if (!visibilityRef.current) {
            visibilityRef.current = true;
            setIsVisible(true);
        }
    }, []);

    const updatePinSource = useCallback((
        source: keyof typeof pinSourcesRef.current,
        isActive: boolean,
    ) => {
        pinSourcesRef.current[source] = isActive;
        mustStayVisibleRef.current = Object.values(pinSourcesRef.current).some(Boolean);
        if (isActive) showNavbar();
    }, [showNavbar]);

    const handleMobileMenuOpenChange = useCallback((isOpen: boolean) => {
        updatePinSource('mobileMenu', isOpen);
        setIsMobileMenuOpen(isOpen);
    }, [updatePinSource]);

    const handleLanguageSelectorOpenChange = useCallback((isOpen: boolean) => {
        updatePinSource('languageSelector', isOpen);
        setIsLanguageSelectorOpen(isOpen);
    }, [updatePinSource]);

    useEffect(() => {
        const mobileOrTablet = window.matchMedia('(max-width: 1023px)');
        let animationFrameId: number | null = null;

        const updateVisibility = () => {
            animationFrameId = null;
            const nextState = getNextNavbarScrollState(scrollStateRef.current, {
                scrollY: window.scrollY,
                isEnabled: mobileOrTablet.matches,
                canScroll: document.documentElement.scrollHeight > window.innerHeight,
                mustStayVisible: mustStayVisibleRef.current,
            });

            scrollStateRef.current = nextState;
            if (nextState.isVisible !== visibilityRef.current) {
                visibilityRef.current = nextState.isVisible;
                setIsVisible(nextState.isVisible);
            }
        };

        const scheduleVisibilityUpdate = () => {
            if (animationFrameId === null) {
                animationFrameId = window.requestAnimationFrame(updateVisibility);
            }
        };

        const currentScrollY = Math.max(0, window.scrollY);
        scrollStateRef.current.previousScrollY = currentScrollY;
        window.addEventListener('scroll', scheduleVisibilityUpdate, { passive: true });
        mobileOrTablet.addEventListener('change', scheduleVisibilityUpdate);

        return () => {
            window.removeEventListener('scroll', scheduleVisibilityUpdate);
            mobileOrTablet.removeEventListener('change', scheduleVisibilityUpdate);
            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    const navbarIsVisible = isVisible || mustStayVisible;

    return (
        <header
            className={`fixed top-0 start-0 w-full z-50 h-16 md:h-20 flex items-center justify-center transition-transform duration-300 ease-in-out motion-reduce:transition-none lg:transform-none ${navbarIsVisible ? 'transform-none' : '[transform:translateY(calc(-100%_-_env(safe-area-inset-top)))]'}
          border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]`}
            onFocusCapture={(event) => {
                const isKeyboardFocus = event.target.matches(':focus-visible');
                updatePinSource('keyboardFocus', isKeyboardFocus);
                setHasKeyboardFocus(isKeyboardFocus);
            }}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    updatePinSource('keyboardFocus', false);
                    setHasKeyboardFocus(false);
                }
            }}
        >
            {/* Background Layer with Blur (Separate to avoid trapping fixed children) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />

            <div className="flex justify-between items-center w-full lg:max-w-[1400px] max-w-[1200px] px-4 h-full relative">
                <div className="">
                    <Link href={lang === 'en' ? '/' : `/${lang}`} className="flex items-center font-bold gap-3">
                        <Image src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1785519157/GOLAN_WIKI-01_1_1_jtqlex.png"
                            alt="Golan Wiki logo"
                            width={40}
                            height={40}
                            quality={85} />
                        {/* <span className="text-2xl font-bold font-outfit bg-[radial-gradient(circle,_#FFFDA3_40%,_#F7F57C_60%,_#F0ED59_100%)] bg-clip-text text-transparent hidden md:block">Golan Wiki</span> */}
                        <Image src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1785519480/GOLAN_WIKI-01_1_2_jqc72a.png"
                            alt="Golan Wiki logo"
                            width={180}
                            height={180}
                            quality={85}
                            className="hidden md:block" />
                    </Link>
                </div>
                <div className="flex flex-row items-center gap-2 md:gap-4">
                    <div className="flex flex-row ">
                        <LanguageSwitcher onOpenChange={handleLanguageSelectorOpenChange} />
                    </div>

                    {/* Mobile Menu Integration */}
                    <MobileDrawer
                        lang={lang}
                        dict={dict}
                        currentUser={currentUser}
                        onOpenChange={handleMobileMenuOpenChange}
                    />
                </div>
            </div>

        </header >
    );
}

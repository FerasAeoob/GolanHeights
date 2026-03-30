'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
export interface GalleryImage {
    url: string;
    alt: string;
}

// ─── Component ───────────────────────────────────────────────────
export default function PhotoGallery({ images }: { images: GalleryImage[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showStartFade, setShowStartFade] = useState(false);
    const [showEndFade, setShowEndFade] = useState(false);
    const [isRtl, setIsRtl] = useState(false);

    const THRESHOLD = 12;

    // ── Scroll-aware fade logic (LTR + RTL safe) ──
    const updateFades = useCallback(function () {
        const el = scrollRef.current;
        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) {
            setShowStartFade(false);
            setShowEndFade(false);
            return;
        }

        const scrolled = Math.abs(el.scrollLeft);

        setShowStartFade(scrolled > THRESHOLD);
        setShowEndFade(scrolled < maxScroll - THRESHOLD);
    }, []);

    useEffect(function () {
        setIsRtl(document.documentElement.dir === 'rtl' || document.dir === 'rtl');

        const el = scrollRef.current;
        if (!el) return;

        // Delay first measurement so browser finishes layout
        const timer = setTimeout(updateFades, 80);

        el.addEventListener('scroll', updateFades, { passive: true });
        window.addEventListener('resize', updateFades);

        return function () {
            clearTimeout(timer);
            el.removeEventListener('scroll', updateFades);
            window.removeEventListener('resize', updateFades);
        };
    }, [updateFades]);

    // ─── Empty state ─────────────────────────────────────────────
    if (!images || images.length === 0) {
        return (
            <div className="w-full h-[30vh] md:h-[50vh] bg-slate-100/50 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-slate-400 border border-slate-200">
                <ImageIcon className="w-12 h-12 mb-3 text-slate-300" />
                <p className="font-medium">No images available</p>
            </div>
        );
    }

    // ─── Single image ────────────────────────────────────────────
    if (images.length === 1) {
        return (
            <div className="w-full h-[40vh] md:h-auto md:aspect-[2/1] lg:aspect-[2.5/1] relative rounded-3xl overflow-hidden shadow-sm group">
                <Image
                    src={images[0].url}
                    alt={images[0].alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    priority
                />
            </div>
        );
    }

    // ─── Two images ──────────────────────────────────────────────
    if (images.length === 2) {
        return (
            <div className="w-full h-[40vh] md:h-auto md:aspect-[2/1] flex flex-col md:flex-row gap-2 md:gap-3 rounded-3xl overflow-hidden shadow-sm">
                {images.map(function (img, idx) {
                    return (
                        <div key={idx} className="relative w-full h-full group overflow-hidden flex-1">
                            <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                priority={idx === 0}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    // ─── Grid class helper for 3+ desktop layout ─────────────────
    function getGridClass(total: number, idx: number) {
        if (total === 3) return 'col-span-2 row-span-1';
        if (total === 4) return idx === 0 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1';
        return 'col-span-1 row-span-1';
    }

    // ─── 3+ images: Mobile carousel + Desktop grid ───────────────
    return (
        <div className="w-full">
            {/* ════════ MOBILE: Snap Carousel + Edge Fades ════════ */}
            <div className="md:hidden relative overflow-hidden rounded-2xl w-full">
                
                {/* Start-edge gradient (Left in LTR, Right in RTL) */}
                <div
                    className="absolute start-0 top-0 bottom-0 w-12 z-20 pointer-events-none transition-opacity duration-300 ease-out"
                    style={{
                        opacity: showStartFade ? 1 : 0,
                        background: isRtl 
                            ? 'linear-gradient(to left, rgba(255,255,255,0.9), transparent)' 
                            : 'linear-gradient(to right, rgba(255,255,255,0.9), transparent)',
                    }}
                />

                {/* End-edge gradient (Right in LTR, Left in RTL) */}
                <div
                    className="absolute end-0 top-0 bottom-0 w-12 z-20 pointer-events-none transition-opacity duration-300 ease-out"
                    style={{
                        opacity: showEndFade ? 1 : 0,
                        background: isRtl 
                            ? 'linear-gradient(to right, rgba(255,255,255,0.9), transparent)' 
                            : 'linear-gradient(to left, rgba(255,255,255,0.9), transparent)',
                    }}
                />

                {/* Scrollable track */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-3 py-1 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
                >
                    {images.map(function (img, idx) {
                        return (
                            <div
                                key={idx}
                                className="relative flex-none w-[85vw] h-[42vh] snap-center rounded-2xl overflow-hidden shadow-sm"
                            >
                                <Image
                                    src={img.url}
                                    alt={img.alt}
                                    fill
                                    sizes="85vw"
                                    className="object-cover"
                                    priority={idx === 0}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ════════ DESKTOP: Bento Grid ════════ */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 aspect-[2/1] rounded-3xl overflow-hidden shadow-sm w-full">
                {/* Hero image — large left half */}
                <div className="relative col-span-2 row-span-2 group overflow-hidden bg-slate-100 w-full h-full">
                    <Image
                        src={images[0].url}
                        alt={images[0].alt}
                        fill
                        sizes="50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        priority
                    />
                </div>

                {/* Secondary tiles (up to 4) */}
                {images.slice(1, 5).map(function (img, idx) {
                    return (
                        <div
                            key={idx}
                            className={`relative w-full h-full ${getGridClass(images.length, idx)} group overflow-hidden bg-slate-100`}
                        >
                            <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                sizes="25vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            />

                            {/* "+N more" overlay on last visible tile */}
                            {idx === 3 && images.length > 5 && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-colors group-hover:bg-black/50">
                                    <span className="text-white font-bold text-2xl tracking-wide drop-shadow-md">
                                        +{images.length - 5}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


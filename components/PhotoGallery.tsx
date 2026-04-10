'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';

export interface GalleryImage {
    url: string;
    alt: string;
}

interface PhotoGalleryProps {
    images: GalleryImage[];
}

export default function PhotoGallery({ images }: PhotoGalleryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [showStartFade, setShowStartFade] = useState(false);
    const [showEndFade, setShowEndFade] = useState(false);
    const [isRtl, setIsRtl] = useState(false);

    const THRESHOLD = 16;

    const updateFades = useCallback(function () {
        const el = scrollRef.current;
        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;

        if (maxScroll <= 0) {
            setShowStartFade(false);
            setShowEndFade(false);
            return;
        }

        const rawScrollLeft = el.scrollLeft;
        const absoluteScroll = Math.abs(rawScrollLeft);

        if (!isRtl) {
            setShowStartFade(absoluteScroll > THRESHOLD);
            setShowEndFade(absoluteScroll < maxScroll - THRESHOLD);
            return;
        }

        const rtlAtStart = absoluteScroll < THRESHOLD;
        const rtlAtEnd = absoluteScroll > maxScroll - THRESHOLD;

        setShowStartFade(!rtlAtEnd);
        setShowEndFade(!rtlAtStart);
    }, [isRtl]);

    useEffect(function () {
        const dir =
            document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';

        setIsRtl(dir);

        const el = scrollRef.current;
        if (!el) return;

        const timer = window.setTimeout(function () {
            updateFades();
        }, 80);

        el.addEventListener('scroll', updateFades, { passive: true });
        window.addEventListener('resize', updateFades);

        return function () {
            window.clearTimeout(timer);
            el.removeEventListener('scroll', updateFades);
            window.removeEventListener('resize', updateFades);
        };
    }, [updateFades]);

    if (!images || images.length === 0) {
        return (
            <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-100/60 px-6 py-14 text-slate-400">
                <ImageIcon className="mb-3 h-12 w-12 text-slate-300" />
                <p className="text-sm font-medium">No images available</p>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className="relative w-full overflow-hidden rounded-3xl aspect-[4/3] md:aspect-[16/9] lg:aspect-[2.3/1] shadow-sm">
                <Image
                    src={images[0].url}
                    alt={images[0].alt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                />
            </div>
        );
    }

    if (images.length === 2) {
        return (
            <div className="grid w-full gap-3 md:grid-cols-2">
                {images.map(function (img, index) {
                    return (
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-3xl aspect-[4/3] md:aspect-[5/4] shadow-sm group"
                        >
                            <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                priority={index === 0}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="relative md:hidden">
                <div
                    className="pointer-events-none absolute inset-y-0 start-0 z-20 w-10 transition-opacity duration-300"
                    style={{
                        opacity: showStartFade ? 1 : 0,
                        background: isRtl
                            ? 'linear-gradient(to left, rgba(255,255,255,0.95), rgba(255,255,255,0))'
                            : 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0))',
                    }}
                />

                <div
                    className="pointer-events-none absolute inset-y-0 end-0 z-20 w-10 transition-opacity duration-300"
                    style={{
                        opacity: showEndFade ? 1 : 0,
                        background: isRtl
                            ? 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0))'
                            : 'linear-gradient(to left, rgba(255,255,255,0.95), rgba(255,255,255,0))',
                    }}
                />

                <div
                    ref={scrollRef}
                    className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {images.map(function (img, index) {
                        return (
                            <div
                                key={index}
                                className="relative w-[86vw] max-w-[520px] flex-none snap-center overflow-hidden rounded-2xl aspect-[4/3] shadow-sm"
                            >
                                <Image
                                    src={img.url}
                                    alt={img.alt}
                                    fill
                                    priority={index === 0}
                                    sizes="86vw"
                                    className="object-cover"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 md:gap-3 md:overflow-hidden md:rounded-3xl md:aspect-[2.1/1]">
                <div className="relative col-span-2 row-span-2 overflow-hidden rounded-3xl md:rounded-none group bg-slate-100">
                    <Image
                        src={images[0].url}
                        alt={images[0].alt}
                        fill
                        priority
                        sizes="(max-width: 1024px) 50vw, 60vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                </div>

                {images.slice(1, 5).map(function (img, index) {
                    const isLastVisible = index === 3 && images.length > 5;

                    return (
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-3xl md:rounded-none group bg-slate-100"
                        >
                            <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                sizes="(max-width: 1024px) 25vw, 20vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            />

                            {isLastVisible && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px] transition-colors duration-300 group-hover:bg-black/45">
                                    <span className="text-2xl font-bold tracking-wide text-white">
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
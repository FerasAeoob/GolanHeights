'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export interface GalleryImage {
    url: string;
    alt: string;
}

interface PhotoGalleryProps {
    images: GalleryImage[];
}

interface DesktopLayout {
    gridClassName: string;
    mainCellClassName: string;
}

const FULL_WIDTH_SIZES = '(min-width: 1200px) 1200px, (min-width: 1024px) calc(100vw - 24px), 100vw';
const HALF_WIDTH_SIZES = '(min-width: 1200px) 594px, (min-width: 1024px) calc(50vw - 18px), 50vw';
const QUARTER_WIDTH_SIZES = '(min-width: 1200px) 291px, (min-width: 1024px) calc(25vw - 15px), 25vw';
const SCROLL_EDGE_THRESHOLD = 16;

function getDesktopLayout(imageCount: number): DesktopLayout {
    if (imageCount === 1) {
        return {
            gridClassName: 'grid-cols-1 grid-rows-1 aspect-[2.3/1] max-h-[32rem]',
            mainCellClassName: '',
        };
    }

    if (imageCount === 2) {
        return {
            gridClassName: 'grid-cols-2 grid-rows-1 aspect-[2.1/1] max-h-[34rem]',
            mainCellClassName: '',
        };
    }

    if (imageCount === 3) {
        return {
            gridClassName: 'grid-cols-2 grid-rows-2 aspect-[2.1/1] max-h-[34rem]',
            mainCellClassName: 'row-span-2',
        };
    }

    if (imageCount === 4) {
        return {
            gridClassName: 'grid-cols-2 grid-rows-2 aspect-[2.1/1] max-h-[34rem]',
            mainCellClassName: '',
        };
    }

    return {
        gridClassName: 'grid-cols-4 grid-rows-2 aspect-[2.1/1] max-h-[34rem]',
        mainCellClassName: 'col-span-2 row-span-2',
    };
}

function getDesktopImageSizes(imageCount: number, index: number) {
    if (imageCount === 1) return FULL_WIDTH_SIZES;
    if (imageCount >= 5 && index > 0) return QUARTER_WIDTH_SIZES;
    return HALF_WIDTH_SIZES;
}

export default function PhotoGallery({ images }: PhotoGalleryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [showStartFade, setShowStartFade] = useState(false);
    const [showEndFade, setShowEndFade] = useState(false);

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
        const isRtl = window.getComputedStyle(el).direction === 'rtl';

        if (!isRtl) {
            setShowStartFade(absoluteScroll > SCROLL_EDGE_THRESHOLD);
            setShowEndFade(absoluteScroll < maxScroll - SCROLL_EDGE_THRESHOLD);
            return;
        }

        const rtlAtStart = absoluteScroll < SCROLL_EDGE_THRESHOLD;
        const rtlAtEnd = absoluteScroll > maxScroll - SCROLL_EDGE_THRESHOLD;

        setShowStartFade(!rtlAtEnd);
        setShowEndFade(!rtlAtStart);
    }, []);

    useEffect(function () {
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

    if (images.length === 0) return null;

    const imageCount = images.length;
    const visibleDesktopImages = images.slice(0, 5);
    const hiddenImageCount = imageCount - visibleDesktopImages.length;
    const desktopLayout = getDesktopLayout(imageCount);
    const imageHoverClassName =
        'object-cover transition-transform duration-500 ease-out motion-reduce:transition-none lg:[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03]';

    return (
        <div className="w-full">
            {imageCount === 1 && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-sm md:aspect-[16/9] lg:hidden">
                    <Image
                        src={images[0].url}
                        alt={images[0].alt}
                        fill
                        fetchPriority="high"
                        sizes="(max-width: 768px) 88vw, 520px"
                        className="object-cover"
                    />
                </div>
            )}

            {imageCount === 2 && (
                <div className="grid w-full gap-3 md:grid-cols-2 lg:hidden">
                    {images.map(function (img, index) {
                        return (
                            <div
                                key={`${img.url}-${index}`}
                                className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 shadow-sm md:aspect-[5/4]"
                            >
                                <Image
                                    src={img.url}
                                    alt={img.alt}
                                    fill
                                    fetchPriority={index === 0 ? 'high' : undefined}
                                    sizes="(min-width: 768px) 50vw, 100vw"
                                    className="object-cover"
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {imageCount >= 3 && (
                <div className="relative lg:hidden">
                    <div
                        className="pointer-events-none absolute inset-y-0 start-0 z-20 w-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.95),rgba(255,255,255,0))] transition-opacity duration-300 rtl:bg-[linear-gradient(to_left,rgba(255,255,255,0.95),rgba(255,255,255,0))]"
                        style={{
                            opacity: showStartFade ? 1 : 0,
                        }}
                    />

                    <div
                        className="pointer-events-none absolute inset-y-0 end-0 z-20 w-10 bg-[linear-gradient(to_left,rgba(255,255,255,0.95),rgba(255,255,255,0))] transition-opacity duration-300 rtl:bg-[linear-gradient(to_right,rgba(255,255,255,0.95),rgba(255,255,255,0))]"
                        style={{
                            opacity: showEndFade ? 1 : 0,
                        }}
                    />

                    <div
                        ref={scrollRef}
                        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {images.map(function (img, index) {
                            return (
                                <div
                                    key={`${img.url}-${index}`}
                                    className="relative aspect-[4/3] w-[86vw] max-w-[520px] flex-none snap-center overflow-hidden rounded-2xl bg-slate-100 shadow-sm"
                                >
                                    <Image
                                        src={img.url}
                                        alt={img.alt}
                                        fill
                                        fetchPriority={index === 0 ? 'high' : undefined}
                                        sizes="90vw"
                                        className="object-cover"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div
                dir="ltr"
                className={`hidden w-full gap-3 overflow-hidden rounded-3xl bg-slate-100 shadow-sm lg:grid ${desktopLayout.gridClassName}`}
            >
                {visibleDesktopImages.map(function (img, index) {
                    const isFirstImage = index === 0;
                    const isLastVisibleImage = index === visibleDesktopImages.length - 1;
                    const showHiddenImageCount = hiddenImageCount > 0 && isLastVisibleImage;

                    return (
                        <div
                            key={`${img.url}-${index}`}
                            className={`group relative min-h-0 min-w-0 overflow-hidden bg-slate-100 ${
                                isFirstImage ? desktopLayout.mainCellClassName : ''
                            }`}
                        >
                            <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                fetchPriority={isFirstImage ? 'high' : undefined}
                                sizes={getDesktopImageSizes(imageCount, index)}
                                className={imageHoverClassName}
                            />

                            {showHiddenImageCount && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 transition-colors duration-300 group-hover:bg-black/45 motion-reduce:transition-none">
                                    <span className="text-2xl font-bold tracking-wide text-white">
                                        +{hiddenImageCount}
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

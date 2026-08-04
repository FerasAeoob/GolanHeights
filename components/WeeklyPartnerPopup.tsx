"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, MapPin, Sparkles } from "lucide-react";
import { listenForFirstMeaningfulInteraction } from "@/lib/first-meaningful-interaction";

export type SpecialPlacePopupProps = {
  placeName: string;
  location: string;
  description: string;
  imageUrl?: string;
  href?: string;
  ctaLabel?: string;
  highlight?: string;
  lang?: "en" | "he" | "ar";
};

const STORAGE_KEY = "weekly_partner_popup_hidden_until";
const SUPPRESSION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

const TRANSLATIONS = {
  en: {
    specialPlace: "Special Place of the Week",
    handpicked: "Handpicked for new visitors",
    closeAvailableIn: "Close available in",
    closeAvailable: "Close available",
    closeButtonAriaWaiting: "Close button available in {seconds} seconds",
    closeButtonAriaActive: "Close featured place popup",
    defaultCta: "Explore This Place",
    highlightText: "Highly Recommended Local Discovery",
  },
  he: {
    specialPlace: "מקום מיוחד השבוע",
    handpicked: "נבחר במיוחד עבור מבקרים חדשים",
    closeAvailableIn: "ניתן לסגור בעוד",
    closeAvailable: "ניתן לסגור כעת",
    closeButtonAriaWaiting: "כפתור הסגירה יהיה זמין בעוד {seconds} שניות",
    closeButtonAriaActive: "סגור חלונית מקום מומלץ",
    defaultCta: "לחצו לפרטים נוספים",
    highlightText: "תגלית מקומית מומלצת ביותר",
  },
  ar: {
    specialPlace: "المكان المميز للأسبوع",
    handpicked: "مختار خصيصًا للزوار الجدد",
    closeAvailableIn: "الإغلاق متاح بعد",
    closeAvailable: "الإغلاق متاح الآن",
    closeButtonAriaWaiting: "زر الإغلاق سيكون متاحًا خلال {seconds} ثوانٍ",
    closeButtonAriaActive: "إغلاق نافذة المكان المميز",
    defaultCta: "استكشف هذا المكان",
    highlightText: "اكتشاف محلي موصى به للغاية",
  },
};

export default function WeeklyPartnerPopup({
  placeName,
  location,
  description,
  imageUrl,
  href,
  ctaLabel,
  highlight,
  lang = "en",
}: SpecialPlacePopupProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const entranceDelayRef = useRef<number | null>(null);
  const closeDelayRef = useRef<number | null>(null);
  const interactionCleanupRef = useRef<(() => void) | null>(null);
  const hasScheduledOpenRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const isRtl = lang === "he" || lang === "ar";
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const displayHighlight =
    highlight === "featured" ? t.highlightText : highlight;

  const displayCtaLabel = ctaLabel || t.defaultCta;

  const fontClass =
    lang === "he"
      ? "font-heebo"
      : lang === "ar"
        ? "font-arabic"
        : "font-outfit";

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const clearEntranceDelay = useCallback(() => {
    if (entranceDelayRef.current) {
      clearTimeout(entranceDelayRef.current);
      entranceDelayRef.current = null;
    }
  }, []);

  const clearCloseDelay = useCallback(() => {
    if (closeDelayRef.current) {
      clearTimeout(closeDelayRef.current);
      closeDelayRef.current = null;
    }
  }, []);

  const clearInteractionListener = useCallback(() => {
    if (interactionCleanupRef.current) {
      interactionCleanupRef.current();
      interactionCleanupRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    clearCountdown();
    clearEntranceDelay();
    clearInteractionListener();

    try {
      const expiry = Date.now() + SUPPRESSION_DURATION;
      localStorage.setItem(STORAGE_KEY, String(expiry));
    } catch (error) {
      console.warn("Failed to set localStorage: ", error);
    }

    document.body.style.overflow = "";

    clearCloseDelay();
    closeDelayRef.current = window.setTimeout(() => {
      setShouldRender(false);
      previouslyFocusedRef.current?.focus({ preventScroll: true });
      previouslyFocusedRef.current = null;
      closeDelayRef.current = null;
    }, 500);
  }, [clearCloseDelay, clearCountdown, clearEntranceDelay, clearInteractionListener]);

  const handleCtaClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleClose();

    if (href) {
      router.push(href);
    }
  };

  useEffect(() => {
    try {
      const hiddenUntil = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (hiddenUntil && Number(hiddenUntil) > now) {
        return;
      }
    } catch (error) {
      console.warn("Storage check failed: ", error);
    }

    interactionCleanupRef.current = listenForFirstMeaningfulInteraction(
      window,
      () => {
        if (hasScheduledOpenRef.current) {
          return;
        }

        hasScheduledOpenRef.current = true;
        setShouldRender(true);
        clearEntranceDelay();
        entranceDelayRef.current = window.setTimeout(() => {
          previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
          setIsOpen(true);
          entranceDelayRef.current = null;
        }, 500);
      },
    );

    return () => {
      clearInteractionListener();
      clearEntranceDelay();
      clearCloseDelay();
      clearCountdown();
      document.body.style.overflow = "";
    };
  }, [clearCloseDelay, clearCountdown, clearEntranceDelay, clearInteractionListener]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      dialogRef.current?.focus({ preventScroll: true });
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    countdownRef.current = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          clearCountdown();
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return clearCountdown;
  }, [clearCountdown, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && secondsLeft === 0 && isOpen) {
        handleClose();
        return;
      }

      if (event.key !== "Tab" || !isOpen || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstFocusable || activeElement === dialogRef.current)) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, isOpen, secondsLeft]);

  if (!shouldRender) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm transition-opacity duration-500 ease-out select-none ${fontClass} ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        } focus:outline-none motion-reduce:transition-none`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-labelledby="place-title"
    >
      {/* Centered Featured Place Card */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`pointer-events-auto relative flex w-full max-w-[calc(100%-1rem)] transform flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-gray-200 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-slate-800/80 dark:bg-slate-900 sm:max-w-[520px] motion-reduce:transform-none motion-reduce:transition-none ${isOpen
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-12 scale-95 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100"
          }`}
      >
        {/* Top Image Section */}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${placeName} Promotional Image`}
              fill
              sizes="(max-width: 768px) 100vw, 520px"
              quality={60}
              className="object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[image:var(--brand-gradient)]">
              <Sparkles className="h-16 w-16 animate-pulse text-white/30 motion-reduce:animate-none" />
            </div>
          )}

          {/* Soft fade from image into the card body */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-gray-200 via-gray-200/70 to-transparent dark:from-slate-900 dark:via-slate-900/70" />

          {/* Close / Countdown Button */}
          <button
            onClick={secondsLeft === 0 ? handleClose : undefined}
            disabled={secondsLeft > 0}
            className={`absolute top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border text-white shadow-lg backdrop-blur-md transition-all duration-300 ${isRtl ? "left-4" : "right-4"
              } ${secondsLeft > 0
                ? "cursor-not-allowed border-white/10 bg-black/40 text-xs font-bold text-slate-300 select-none"
                : "cursor-pointer border-white/20 bg-black/60 hover:scale-105 hover:bg-black/80"
              }`}
            aria-label={
              secondsLeft > 0
                ? t.closeButtonAriaWaiting.replace(
                  "{seconds}",
                  String(secondsLeft),
                )
                : t.closeButtonAriaActive
            }
          >
            {secondsLeft > 0 ? (
              <span className="text-sm font-extrabold tabular-nums">
                {secondsLeft}
              </span>
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="relative flex flex-col gap-4 p-6 text-start sm:p-8">
          {/* Soft faded separator line */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent dark:via-white/10" />

          {/* Tagline */}
          <div className="flex items-center gap-1.5 font-extrabold tracking-widest uppercase">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[13px] text-amber-400 dark:text-amber-400">
              {t.specialPlace}
            </span>
          </div>

          {/* Title & Location */}
          <div className="flex flex-col gap-4">
            <h3
              id="place-title"
              className="text-2xl font-black leading-tight tracking-tight text-slate-950 dark:text-white"
            >
              {placeName}
            </h3>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 sm:text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span>{location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            {description}
          </p>

          {/* Highlight */}
          {displayHighlight && (
            <div className="flex items-start gap-2 rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-3 text-xs font-medium italic leading-relaxed text-brand-blue dark:border-brand-yellow/30 dark:bg-brand-yellow/10 dark:text-brand-yellow">
              <span className="font-bold text-amber-500">★</span>
              <span>{displayHighlight}</span>
            </div>
          )}

          {/* Action Area */}
          <div className="mt-6 w-full px-6 sm:px-8">
            <div className="flex w-full flex-col items-center gap-4 text-center">
              {href && (
                <button
                  onClick={handleCtaClick}
                  className="mx-auto flex h-14 w-full max-w-[520px] items-center justify-center rounded-2xl bg-brand-yellow py-3.5 text-center font-bold text-brand-ink shadow-[0_14px_30px] shadow-brand-yellow/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-yellow-hover active:translate-y-0 active:bg-brand-yellow-active dark:bg-brand-yellow dark:hover:bg-brand-yellow-hover"
                >
                  {displayCtaLabel}
                </button>
              )}

              <p className="mx-auto mt-3 w-full max-w-[520px] text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                {t.handpicked}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

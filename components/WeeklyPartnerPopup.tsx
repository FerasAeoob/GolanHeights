"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, MapPin, Sparkles } from "lucide-react";

export type SpecialPlacePopupProps = {
  placeName: string;
  location: string;
  description: string;
  imageUrl?: string;
  href?: string;
  ctaLabel?: string;
  category?: string;
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
  }
};

export default function WeeklyPartnerPopup({
  placeName,
  location,
  description,
  imageUrl,
  href,
  ctaLabel,
  category,
  highlight,
  lang = "en",
}: SpecialPlacePopupProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleClose();
    if (href) {
      router.push(href);
    }
  };

  // Initialize and check suppression state on browser mount
  useEffect(() => {
    setMounted(true);

    try {
      const hiddenUntil = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (hiddenUntil && Number(hiddenUntil) > now) {
        // Still within 10-minute suppression window, do not render
        return;
      }

      // Safe to render, set element to DOM tree
      setShouldRender(true);

      // Introduce a slight premium delay (500ms) before sliding up
      const entranceDelay = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => {
        clearTimeout(entranceDelay);
        // Ensure timers are cleaned up if component unmounts prematurely
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    } catch (e) {
      console.warn("Storage check failed: ", e);
    }
  }, []);

  // 🔒 Lock body scrolling when modal is open, and cleanly restore on close or unmount
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ⏱️ Start countdown ONLY when popup opens
  useEffect(() => {
    if (isOpen) {
      // Countdown interval ticking every 1 second
      setSecondsLeft(5);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isOpen]);

  // ⌨️ Escape key dismiss listener (only allowed after countdown ends)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && secondsLeft === 0 && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, secondsLeft]);

  const handleClose = () => {
    setIsOpen(false);
    
    // Clear countdown timer immediately
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // Save 10-minute suppression in localStorage
    try {
      const expiry = Date.now() + SUPPRESSION_DURATION;
      localStorage.setItem(STORAGE_KEY, String(expiry));
    } catch (e) {
      console.warn("Failed to set localStorage: ", e);
    }

    // Clean up body scroll lock immediately on close
    document.body.style.overflow = "";

    // Unmount from DOM after transition out finishes (500ms)
    setTimeout(() => {
      setShouldRender(false);
    }, 500);
  };

  if (!mounted || !shouldRender) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const displayHighlight = highlight === "featured" ? t.highlightText : highlight;
  const displayCtaLabel = ctaLabel || t.defaultCta;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm
        transition-opacity duration-500 ease-out select-none
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-title"
    >
      {/* Centered Featured Place Card */}
      <div
        dir={lang === "he" || lang === "ar" ? "rtl" : "ltr"}
        className={`w-full max-w-[calc(100%-1rem)] sm:max-w-[520px] rounded-[2.5rem]
          bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 
          shadow-2xl flex flex-col overflow-hidden relative pointer-events-auto
          transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? "translate-y-0 scale-100" : "translate-y-12 scale-95 opacity-0"}`}
      >
        {/* Top Image Section (Aspect 16:10) */}
        <div className="relative w-full aspect-[16/10] overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-950">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${placeName} Promotional Image`}
              fill
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
          ) : (
            // Premium Fallback Gradient
            <div className="w-full h-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white/30 animate-pulse" />
            </div>
          )}
          {/* Subtle overlay gradient on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

          {/* Category Badge on start of image */}
          {category && (
            <div className={`absolute top-4 ${lang === "he" || lang === "ar" ? "right-4" : "left-4"} z-10`}>
              <span className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md uppercase border border-white/20 shadow-sm">
                {category}
              </span>
            </div>
          )}

          {/* Close / Countdown Button on end of image */}
          <button
            onClick={secondsLeft === 0 ? handleClose : undefined}
            disabled={secondsLeft > 0}
            className={`absolute top-4 ${lang === "he" || lang === "ar" ? "left-4" : "right-4"} z-20 flex items-center justify-center rounded-full transition-all duration-300 w-10 h-10 border text-white backdrop-blur-md shadow-lg
              ${secondsLeft > 0 
                ? "bg-black/40 border-white/10 text-slate-300 text-xs font-bold cursor-not-allowed select-none" 
                : "bg-black/60 hover:bg-black/80 border-white/20 cursor-pointer hover:scale-105"}`}
            aria-label={secondsLeft > 0 ? t.closeButtonAriaWaiting.replace("{seconds}", String(secondsLeft)) : t.closeButtonAriaActive}
          >
            {secondsLeft > 0 ? (
              <span className="tabular-nums font-extrabold text-sm">{secondsLeft}</span>
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-4 p-6 sm:p-8 text-start">
          {/* Tagline */}
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>{t.specialPlace}</span>
          </div>

          {/* Title & Location */}
          <div className="flex flex-col gap-1">
            <h3 id="place-title" className="text-slate-900 dark:text-white font-black text-2xl tracking-tight leading-tight">
              {placeName}
            </h3>
            <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
            {description}
          </p>

          {/* Highlight (Optional Accent Box) */}
          {displayHighlight && (
            <div className="text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 text-xs leading-relaxed italic font-medium flex items-start gap-2">
              <span className="text-amber-500 font-bold">★</span>
              <span>{displayHighlight}</span>
            </div>
          )}

          {/* Action Area */}
          <div className="flex flex-col gap-2 mt-2">
            {href && (
              <button
                onClick={handleCtaClick}
                className="w-full py-3.5 rounded-2xl text-white font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:scale-[1.01] shadow-emerald-700/20 hover:shadow-emerald-700/30 text-center uppercase tracking-wider cursor-pointer"
              >
                {displayCtaLabel}
              </button>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-semibold">
              {t.handpicked}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

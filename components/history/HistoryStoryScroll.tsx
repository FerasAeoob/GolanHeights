"use client";

import Image from "next/image";
import {
  Castle,
  Compass,
  Landmark,
  Mountain,
  Route,
  Sprout,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type HistoryChapter = {
  label: string;
  category: string;
  title: string;
  period: string;
  visualTitle: string;
  visualMeta: string;
  imageAlt: string;
  description: string;
  bullets: string[];
};

type HistoryDictionary = {
  eyebrow: string;
  title: string;
  subtitle: string;
  scrollPrompt: string;
  progressLabel: string;
  visualLabel: string;
  chapters: HistoryChapter[];
};

type HistoryStoryScrollProps = {
  history: HistoryDictionary;
  lang: "en" | "ar" | "he";
};

const icons = [Sprout, Landmark, Castle, Mountain, Route, Compass];

const chapterSkins = [
  {
    glow: "from-emerald-300/30 via-lime-200/15 to-stone-400/20",
    ring: "ring-emerald-300/30",
    accent: "text-emerald-200",
  },
  {
    glow: "from-amber-200/30 via-orange-200/15 to-zinc-400/20",
    ring: "ring-amber-200/30",
    accent: "text-amber-100",
  },
  {
    glow: "from-stone-200/30 via-emerald-200/10 to-cyan-200/15",
    ring: "ring-stone-200/25",
    accent: "text-stone-100",
  },
  {
    glow: "from-sky-200/30 via-emerald-200/15 to-rose-200/10",
    ring: "ring-sky-200/25",
    accent: "text-sky-100",
  },
  {
    glow: "from-zinc-200/25 via-sky-200/10 to-emerald-200/15",
    ring: "ring-zinc-200/25",
    accent: "text-zinc-100",
  },
  {
    glow: "from-emerald-200/30 via-cyan-200/15 to-yellow-200/10",
    ring: "ring-emerald-200/25",
    accent: "text-emerald-100",
  },
];

export default function HistoryStoryScroll({
  history,
  lang,
}: HistoryStoryScrollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const isRtl = lang === "ar" || lang === "he";
  const isArabic = lang === "ar";
  const chapters = history.chapters ?? [];

  const activeChapter = chapters[activeIndex] ?? chapters[0];
  const activeSkin = chapterSkins[activeIndex % chapterSkins.length];
  const ActiveIcon = icons[activeIndex % icons.length];
  const progress = chapters.length ? ((activeIndex + 1) / chapters.length) * 100 : 0;

  const observerThresholds = useMemo(
    () => Array.from({ length: 9 }, (_, index) => index / 8),
    []
  );

  useEffect(() => {
    if (!chapters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const index = Number(visibleEntry?.target.getAttribute("data-index"));
        if (Number.isInteger(index)) {
          setActiveIndex(index);
        }
      },
      {
        root: null,
        rootMargin: "-28% 0px -42% 0px",
        threshold: observerThresholds,
      }
    );

    chapterRefs.current.forEach((chapter) => {
      if (chapter) observer.observe(chapter);
    });

    return () => observer.disconnect();
  }, [chapters.length, observerThresholds]);

  if (!activeChapter) return null;

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="relative isolate w-full bg-zinc-950 px-4 py-20 text-white sm:px-6 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 18%, rgba(16,185,129,0.20), transparent 28%), radial-gradient(circle at 82% 8%, rgba(250,204,21,0.10), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 44px 44px, 64px 64px",
        }}
      />

      <div className="mx-auto flex w-full max-w-[1200px] flex-col">
        <div className="mb-10 max-w-3xl px-1 md:mb-16">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-emerald-300 md:text-sm">
            {history.eyebrow}
          </p>
          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-normal text-white sm:text-5xl md:text-6xl">
            {history.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg md:mt-6 md:text-xl md:leading-8">
            {history.subtitle}
          </p>
        </div>

        <div className="grid w-full items-start gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-14">
          <aside className="hidden self-start xl:sticky xl:top-24 xl:block">
            <div className="h-[calc(100dvh-7rem)] min-h-[480px] max-h-[640px]">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="relative h-[calc(100dvh-8.5rem)] min-h-[456px] max-h-[616px] overflow-hidden rounded-[1.55rem] bg-zinc-900">
                  {!imageFailed && (
                    <Image
                      src="/images/places/mount-bental.png"
                      alt={activeChapter.imageAlt}
                      fill
                      priority
                      sizes="(min-width: 1024px) 44vw, 100vw"
                      className="object-cover opacity-55 transition-opacity duration-500 motion-reduce:transition-none"
                      onError={() => setImageFailed(true)}
                    />
                  )}

                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 bg-gradient-to-br ${activeSkin.glow}`}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-35"
                    style={{
                      backgroundImage:
                        "linear-gradient(115deg, transparent 0 18%, rgba(255,255,255,0.12) 18% 18.35%, transparent 18.35% 42%, rgba(255,255,255,0.09) 42% 42.3%, transparent 42.3%), radial-gradient(circle at 62% 48%, transparent 0 18%, rgba(255,255,255,0.10) 18.2% 18.6%, transparent 18.8% 30%, rgba(255,255,255,0.08) 30.2% 30.5%, transparent 30.8%)",
                    }}
                  />

                  <div className="relative flex h-full flex-col justify-between p-7">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/65">
                          {history.visualLabel}
                        </p>
                        <p className={`mt-3 text-sm font-semibold ${activeSkin.accent}`}>
                          {activeChapter.category}
                        </p>
                      </div>

                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ${activeSkin.ring}`}
                      >
                        <ActiveIcon className="h-7 w-7 text-white" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="max-w-md">
                      <div className="mb-5 inline-flex rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                        {activeChapter.label}
                      </div>
                      <h2 className="text-3xl font-extrabold leading-tight tracking-normal text-white 2xl:text-4xl">
                        {activeChapter.visualTitle}
                      </h2>
                      <p className="mt-4 text-sm leading-7 text-zinc-200 2xl:text-base">
                        {activeChapter.visualMeta}
                      </p>
                    </div>

                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-white/15"
                      aria-label={history.progressLabel}
                      role="progressbar"
                      aria-valuemin={1}
                      aria-valuemax={chapters.length}
                      aria-valuenow={activeIndex + 1}
                    >
                      <div
                        className="h-full rounded-full bg-emerald-300 transition-[width] duration-500 motion-reduce:transition-none"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="relative">
            <div className="flex flex-col gap-5 xl:gap-16 xl:pb-32">
              {chapters.map((chapter, index) => {
                const ChapterIcon = icons[index % icons.length];
                const skin = chapterSkins[index % chapterSkins.length];
                const isActive = activeIndex === index;

                return (
                  <article
                    key={`${chapter.label}-${chapter.title}`}
                    ref={(node) => {
                      chapterRefs.current[index] = node;
                    }}
                    data-index={index}
                    className={`relative w-full min-w-0 overflow-hidden rounded-3xl border p-6 shadow-xl transition-all duration-500 motion-reduce:transition-none sm:p-8 xl:min-h-[470px] xl:rounded-[2rem] xl:p-9 ${
                      isActive
                        ? "border-emerald-300/35 bg-white/[0.09] shadow-emerald-950/30"
                        : "border-white/10 bg-white/[0.045] shadow-black/20"
                    }`}
                  >
                    <div
                      className={`mb-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 sm:h-12 sm:w-12 ${skin.ring}`}
                    >
                      <ChapterIcon className="h-5 w-5 text-white sm:h-6 sm:w-6" aria-hidden="true" />
                    </div>

                    <div className="flex min-w-0 flex-col gap-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="max-w-full rounded-full border border-white/12 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 sm:text-[11px] sm:tracking-[0.2em]">
                            {chapter.label}
                          </span>
                          <span className="max-w-full rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                            {chapter.category}
                          </span>
                        </div>

                        <h3
                          className={`mt-5 text-2xl font-extrabold tracking-normal text-white sm:text-3xl md:text-4xl ${
                            isArabic ? "leading-[1.35]" : "leading-tight"
                          }`}
                        >
                          {chapter.title}
                        </h3>
                        <p
                          className={`text-sm font-semibold text-zinc-400 ${
                            isArabic ? "mt-4 leading-7" : "mt-3"
                          }`}
                        >
                          {chapter.period}
                        </p>
                      </div>

                      <p className="text-[15px] leading-7 text-zinc-200 sm:text-base md:text-lg md:leading-8">
                        {chapter.description}
                      </p>

                      <div aria-hidden="true" className="my-1 h-px w-full bg-white/10" />

                      <ul className="grid min-w-0 gap-x-10 gap-y-3 sm:grid-cols-2">
                        {chapter.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="group flex min-w-0 list-none items-start gap-3.5 text-start text-sm leading-6 text-zinc-300"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2.5 h-px w-6 shrink-0 rounded-full bg-emerald-300/60 transition-colors duration-300 group-hover:bg-emerald-200 motion-reduce:transition-none"
                            />
                            <span className="block min-w-0 break-words text-zinc-300/90 transition-colors duration-300 group-hover:text-white motion-reduce:transition-none">
                              {bullet}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.25em] text-white/40 xl:hidden">
          {history.scrollPrompt}
        </p>
      </div>
    </section>
  );
}

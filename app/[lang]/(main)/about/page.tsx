import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/get-dictionary";
import {
  MapPin,
  Utensils,
  TreePine,
  Bed,
  Binoculars,
  Store,
  Heart,
  Globe,
  TrendingUp,
} from "lucide-react";

/* ─── Metadata ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "he" | "ar");

  return {
    title: dict.about?.metaTitle,
    description: dict.about?.metaDescription,
    alternates: {
      canonical: `https://www.golanwiki.com/${lang}/about`,
    },
  };
}

/* ─── Page ─── */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "he" | "ar");
  const t = dict.about;

  const isRtl = lang === "ar" || lang === "he";

  const cards = [
    {
      icon: <Heart className="h-5 w-5" />,
      title: t.card1Title,
      body: t.card1Body,
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: t.card2Title,
      body: t.card2Body,
    },
    {
      icon: <Store className="h-5 w-5" />,
      title: t.card3Title,
      body: t.card3Body,
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: t.card4Title,
      body: t.card4Body,
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: t.card5Title,
      body: t.card5Body,
    },
  ];

  const features = [
    { icon: <Utensils className="h-4 w-4" />, label: t.feat1 },
    { icon: <TreePine className="h-4 w-4" />, label: t.feat2 },
    { icon: <Binoculars className="h-4 w-4" />, label: t.feat3 },
    { icon: <Bed className="h-4 w-4" />, label: t.feat4 },
    { icon: <Store className="h-4 w-4" />, label: t.feat5 },
    { icon: <MapPin className="h-4 w-4" />, label: t.feat6 },
  ];

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="flex min-h-screen w-full flex-col bg-white"
    >
      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden bg-zinc-950">
        {/* brand glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute top-[-80px] end-[-120px] h-[420px] w-[420px] rounded-full bg-brand-yellow/10 blur-3xl md:top-[-140px] md:end-[-180px] md:h-[720px] md:w-[720px]" />
          <div className="absolute bottom-[-160px] start-[-180px] h-[360px] w-[360px] rounded-full bg-brand-blue/[0.06] blur-3xl md:h-[520px] md:w-[520px]" />
        </div>

        <div className="relative flex w-full flex-col px-4 pb-9 pt-25 md:pt-16 sm:px-6 md:pb-12 md:pt-28">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-yellow md:text-sm">
              {t.eyebrow}
            </p>

            <h1 className="mb-5 max-w-4xl text-[34px] font-extrabold leading-[1.25] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t.heroTitle}
            </h1>

            <p className="mb-8 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg md:text-xl">
              {t.heroSubtitle}
            </p>

            <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Link
                href={`/${lang}/places`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-yellow px-6 py-3 text-sm font-bold text-brand-blue shadow-sm transition-colors duration-200 hover:bg-brand-yellow-hover active:bg-brand-yellow-active sm:w-auto"
              >
                <MapPin className="h-4 w-4" />
                {t.ctaExplore}
              </Link>

              <Link
                href={`/${lang}`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-zinc-200 transition-colors duration-200 hover:border-brand-yellow/60 hover:text-brand-yellow sm:w-auto"
              >
                {t.ctaHome}
              </Link>
            </div>
          </div>
        </div>

      {/* ── Feature pills ── */}
        <div className="relative flex w-full px-4 pb-12 sm:px-6">
          <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-3">
            {features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-300"
              >
                <span className="flex text-brand-yellow">{feature.icon}</span>
                <span>{feature.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="flex w-full flex-col px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col">
          {/* Intro */}
          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center text-center md:mb-16">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-blue md:text-sm">
              {t.sectionLabel}
            </p>

            <h2 className="mb-5 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              {t.sectionTitle}
            </h2>

            <p className="text-base leading-8 text-slate-600 md:text-lg">
              {t.introParagraph}
            </p>
          </div>

          {/* Cards */}
          <div className="flex w-full flex-wrap justify-center gap-5">
            {cards.map((card, index) => (
              <article
                key={index}
                className="flex min-h-[250px] w-full max-w-[350px] flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:max-w-[380px] lg:max-w-[360px]"
              >
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-yellow/10 text-brand-blue">
                  {card.icon}
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="mb-3 text-lg font-extrabold text-slate-950">
                    {card.title}
                  </h3>

                  <p className="text-[15px] leading-7 text-slate-600">
                    {card.body}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Mission */}
          <div className="mt-10 flex w-full overflow-hidden rounded-3xl bg-zinc-950 px-6 py-10 sm:px-8 md:mt-12 md:px-12 md:py-12">
            <div className="relative flex w-full flex-col items-center justify-center text-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-yellow/10 blur-3xl"
              />

              <div className="relative flex max-w-3xl flex-col items-center">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-yellow md:text-sm">
                  {t.missionLabel}
                </p>

                <p className="mb-8 text-xl font-extrabold leading-8 text-white md:text-2xl md:leading-10">
                  {t.missionText}
                </p>

                <Link
                  href={`/${lang}/places`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-7 py-3 text-sm font-bold text-brand-blue transition-colors duration-200 hover:bg-brand-yellow-hover active:bg-brand-yellow-active"
                >
                  <MapPin className="h-4 w-4" />
                  {t.ctaExplore}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

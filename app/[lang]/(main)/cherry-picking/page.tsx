import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, CloudSun } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { getDictionary, type Locale } from "@/lib/get-dictionary";
import { cherryPickingCategory } from "@/lib/categories";
import { getLocalizedPathname } from "@/utils/navigation";

type CherryPickingPageProps = {
  params: Promise<{ lang: Locale }>;
};

const SITE_URL = "https://www.golanwiki.com";

export async function generateMetadata({
  params,
}: CherryPickingPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const content = dict.cherryPickingSeason;
  const path = getLocalizedPathname("/cherry-picking", lang);

  return {
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        en: `${SITE_URL}/cherry-picking`,
        ar: `${SITE_URL}/ar/cherry-picking`,
        he: `${SITE_URL}/he/cherry-picking`,
        "x-default": `${SITE_URL}/cherry-picking`,
      },
    },
  };
}

export default async function CherryPickingPage({
  params,
}: CherryPickingPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const content = dict.cherryPickingSeason;
  const placesHref = getLocalizedPathname("/places", lang);
  const homeHref = getLocalizedPathname("/", lang);

  return (
    <div className="min-h-[100dvh] bg-stone-100">
      <section
        aria-labelledby="cherry-season-title"
        className="relative isolate flex min-h-screen min-h-[100dvh] items-end overflow-hidden bg-slate-950"
      >
        <Image
          src={cherryPickingCategory.image}
          alt={content.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(244,63,94,0.18),transparent_34%)]" />

        <div className="relative mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16 lg:max-w-[1400px] lg:px-10 lg:py-20">
          <Reveal distance={20}>
            <div className="max-w-3xl text-start text-white">
              <span className="inline-flex min-h-10 items-center rounded-full border border-rose-200/35 bg-rose-950/75 px-4 py-2 text-sm font-semibold tracking-wide text-rose-50 shadow-sm backdrop-blur-sm">
                {content.badge}
              </span>

              <h1
                id="cherry-season-title"
                className="mt-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-7xl"
              >
                {content.headline}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl sm:leading-9">
                {content.description}
              </p>

              <div className="mt-8 max-w-2xl rounded-2xl border border-white/60 bg-[#f6f0e5]/95 p-5 text-slate-900 shadow-xl shadow-black/15 backdrop-blur-sm sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-800" aria-hidden="true">
                    <CalendarDays className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose-800">
                      {content.dateLabel}
                    </p>
                    <p className="mt-1 text-3xl font-bold tracking-tight" dir={lang === "en" ? "ltr" : undefined}>
                      {content.date}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex max-w-2xl items-start gap-3 text-sm leading-6 text-slate-200 sm:text-base">
                <CloudSun className="mt-0.5 h-5 w-5 shrink-0 text-rose-200" aria-hidden="true" />
                <p>{content.supportingText}</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={placesHref}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-yellow px-6 py-3 font-semibold text-brand-ink shadow-lg shadow-black/15 transition-colors hover:bg-brand-yellow-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {content.primaryButton}
                </Link>
                <Link
                  href={homeHref}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {content.secondaryButton}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

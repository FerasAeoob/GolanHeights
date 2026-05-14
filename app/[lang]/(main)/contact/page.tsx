import type { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import {
  Mail,
  MapPin,
  Clock,
  Store,
  AlertCircle,
  MessageSquare,
  Heart,
} from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import BusinessRequestButton from "@/components/contact/BusinessRequestButton";

/* ─── Metadata ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "he" | "ar");

  return {
    title: dict.contactPage?.metaTitle,
    description: dict.contactPage?.metaDescription,
    alternates: {
      canonical:
        lang === "en"
          ? "https://www.golanwiki.com/contact"
          : `https://www.golanwiki.com/${lang}/contact`,
    },
  };
}

/* ─── Page ─── */
export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ reason?: string }>;
}) {
  const { lang } = await params;
  const { reason } = await searchParams;

  const dict = await getDictionary(lang as "en" | "he" | "ar");
  const t = dict.contactPage;

  const isRtl = lang === "ar" || lang === "he";

  const allowedReasons = ["general", "add", "update", "report", "partnership"];
  const initialReason = allowedReasons.includes(reason || "") ? reason : "general";

  const cards = [
    {
      icon: <Store className="h-6 w-6" />,
      title: t.card1Title,
      body: t.card1Body,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: t.card2Title,
      body: t.card2Body,
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: t.card3Title,
      body: t.card3Body,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="flex min-h-screen w-full flex-col bg-white"
    >
      {/* ── Hero ── */}
      <section className="relative flex w-full flex-col overflow-hidden bg-zinc-950 px-4 pb-12 pt-25 md:pt-16 sm:px-6 md:pb-20 md:pt-28">
        {/* Decorative elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 end-[-120px] h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl md:-top-56 md:end-[-180px] md:h-[720px] md:w-[720px]" />
          <div className="absolute bottom-[-220px] start-[-180px] h-[360px] w-[360px] rounded-full bg-emerald-500/[0.06] blur-3xl md:h-[520px] md:w-[520px]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 md:text-sm">
            {t.eyebrow}
          </p>

          <h1 className="mb-5 max-w-4xl text-[34px] font-extrabold leading-[1.25] tracking-tight text-white sm:text-5xl md:text-6xl">
            {t.heroTitle}
          </h1>

          <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg md:text-xl">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* ── Contact Cards ── */}
      <section className="relative -mt-10 px-4 sm:px-6 md:-mt-12">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${card.color}`}
              >
                {card.icon}
              </div>

              <h3 className="mb-3 text-lg font-extrabold text-slate-950">
                {card.title}
              </h3>

              <p className="text-[15px] leading-7 text-slate-600">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main Contact Section Form + Info ── */}
      <section className="flex w-full flex-col px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left: Form Card */}
          <div id="contact-form" className="w-full scroll-mt-28 lg:w-2/3">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10 md:p-12">
              <div className="mb-10">
                <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
                  {t.formTitle}
                </h2>

                <div className="h-1 w-12 rounded-full bg-emerald-500" />
              </div>

              <ContactForm
                lang={lang}
                dict={dict}
                initialReason={initialReason}

              />
            </div>
          </div>

          {/* Right: Info Column */}
          <div className="flex w-full flex-col gap-8 lg:w-1/3">
            {/* Contact Info Card */}
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h3 className="mb-8 text-xl font-extrabold text-slate-950">
                {t.infoTitle}
              </h3>

              <div className="flex flex-col gap-8">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {t.infoEmail}
                    </span>

                    <a
                      href="mailto:support@golanwiki.com"
                      className="font-bold text-slate-900 transition-colors hover:text-emerald-600"
                    >
                      support@golanwiki.com
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {t.infoLocation}
                    </span>

                    <span className="font-bold text-slate-900">
                      {t.infoLocationValue}
                    </span>
                  </div>
                </div>

                {/* Response Time */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {t.infoResponse}
                    </span>

                    <span className="font-bold text-slate-900">
                      {t.infoResponseValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social / Support Card */}
            <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 p-8 text-white shadow-lg shadow-emerald-600/20">
              <div className="absolute end-[-20px] top-[-20px] h-32 w-32 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md">
                  <Heart className="h-5 w-5 fill-current" />
                </div>

                <h4 className="text-lg font-extrabold leading-tight">
                  {lang === "he"
                    ? "אוהבים את הגולן?"
                    : lang === "ar"
                      ? "تحب الجولان؟"
                      : "Love the Golan?"}
                </h4>

                <p className="text-sm font-medium leading-relaxed text-emerald-50">
                  {lang === "he"
                    ? "הצטרפו אלינו בבניית המדריך המקיף ביותר לאזור. כל המלצה עוזרת!"
                    : lang === "ar"
                      ? "انضم إلينا في بناء الدليل الأكثر شمولاً للمنطقة. كل توصية تساعد!"
                      : "Join us in building the most comprehensive guide to the region. Every recommendation helps!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Business CTA Section ── */}
      <section className="flex w-full flex-col px-4 pb-24 sm:px-6">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="relative overflow-hidden rounded-[40px] bg-zinc-950 px-8 py-12 text-center md:px-16 md:py-20 lg:text-start">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -end-20 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
            </div>

            <div className="relative flex flex-col items-center justify-between gap-10 lg:flex-row">
              <div className="flex max-w-2xl flex-col gap-4">
                <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {t.businessTitle}
                </h2>

                <p className="text-base leading-relaxed text-zinc-400 md:text-lg">
                  {t.businessBody}
                </p>
              </div>

              <BusinessRequestButton
                lang={lang}
                label={t.businessCta}
                isRtl={isRtl}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
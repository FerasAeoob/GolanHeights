import React from "react";

interface LegalSection {
  heading: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
  icon?: React.ReactNode;
}

export default function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  sections,
  icon,
}: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-zinc-950 pt-28 pb-16 px-4 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-yellow/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          {icon && (
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-2xl mb-6">
              {icon}
            </span>
          )}

          <h1
            dir="auto"
            className="w-full !text-center text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
          >
            {title}
          </h1>

          <div className="w-full flex justify-center">
            <p
              dir="auto"
              className="w-full max-w-2xl mx-auto !text-center text-lg text-zinc-400 leading-relaxed mb-6"
            >
              {subtitle}
            </p>
          </div>

          <div className="w-full flex justify-center">
            <span className="inline-flex items-center justify-center text-sm text-zinc-500 border border-zinc-800 rounded-full px-4 py-1.5 !text-center">
              {lastUpdated}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 pb-24">
        <article className="space-y-12">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6 sm:p-8"
            >
              <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 rounded-full bg-brand-yellow shrink-0" />
                {section.heading}
              </h2>

              <div className="text-zinc-600 leading-relaxed space-y-3 text-[15px]">
                {section.content}
              </div>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}

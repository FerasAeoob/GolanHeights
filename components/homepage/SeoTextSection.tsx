import React from "react";
import { Reveal } from "@/components/animation/Reveal";

type SeoCopy = {
  travelGuideTitle: string;
  travelGuideText: string;
  natureTitle: string;
  natureText: string;
  foodTitle: string;
  foodText: string;
  staysTitle: string;
  staysText: string;
  viewpointsTitle: string;
  viewpointsText: string;
  villagesTitle: string;
  villagesText: string;
};

type SeoDictionary = {
  seo?: SeoCopy;
};

type SeoCard = {
  id: "nature" | "food" | "stays" | "viewpoints" | "villages";
  title: string;
  text: string;
  featured?: boolean;
};

export default function SeoTextSection({ dict }: { dict: SeoDictionary }) {
  if (!dict.seo) return null;

  const cards: SeoCard[] = [
    {
      id: "nature",
      title: dict.seo.natureTitle,
      text: dict.seo.natureText,
    },
    {
      id: "food",
      title: dict.seo.foodTitle,
      text: dict.seo.foodText,
    },
    {
      id: "stays",
      title: dict.seo.staysTitle,
      text: dict.seo.staysText,
    },
    {
      id: "viewpoints",
      title: dict.seo.viewpointsTitle,
      text: dict.seo.viewpointsText,
    },
    {
      id: "villages",
      title: dict.seo.villagesTitle,
      text: dict.seo.villagesText,
      featured: true,
    },
  ];

  return (
    <section className="mt-2 mb-14 flex flex-col items-center justify-center sm:mt-4 md:mb-20">
      <div className="flex w-full max-w-[1200px] flex-col items-center justify-center px-4 lg:max-w-[1400px]">
        <Reveal className="w-full" duration={600} distance={16} once>
          <div className="mx-auto mb-7 flex w-full flex-col items-center justify-center gap-2 text-center sm:gap-3 md:mb-10">
            <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
              {dict.seo.travelGuideTitle}
            </h2>
            <p className="relative max-w-4xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
              {dict.seo.travelGuideText}
            </p>
          </div>
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-4 box-border sm:p-1 md:grid-cols-2 md:gap-6">
          {cards.map((card, index) => (
            <Reveal
              key={card.id}
              className={`h-full ${card.featured ? "md:col-span-2" : ""}`}
              delay={index * 80}
              duration={650}
              distance={20}
              once
            >
              <div
                className={`${card.featured ? "bg-slate-50" : "bg-white"} flex h-full w-full flex-col rounded-2xl p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg sm:p-6 md:p-8`}
              >
                <h3 className="mb-2 text-lg font-bold text-slate-900 sm:mb-3 sm:text-xl">
                  {card.title}
                </h3>
                <p
                  className={`text-base leading-relaxed text-slate-600 ${card.featured ? "max-w-5xl" : ""}`}
                >
                  {card.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

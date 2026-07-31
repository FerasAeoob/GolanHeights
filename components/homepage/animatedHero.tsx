import Image from "next/image";
import Link from "next/link";

import { BookOpen, Compass, MapPin, Mountain } from "lucide-react";
import HeroInfoCard from "./Hero.infocard";
import { Reveal } from "@/components/animation/Reveal";
import WeatherCard from "./WeatherCard";
import ScrollToExploreButton from "./ScrollToExploreButton";

type HeroDictionary = {
    northenisrael: string;
    heroTitleMain: string;
    heroTitleSub: string;
    herodes: string;
    explorenow: string;
    exploreHistoryCta: string;
    herocards: {
        villages: string;
        villagedesc: string;
        hiddengems: string;
        hiddengemsdesc: string;
    };
};

export default function AnimatedHero({ lang, dict }: { lang: string; dict: HeroDictionary }) {

    return (
        <section className="relative w-full min-h-screen min-h-[100dvh] flex flex-col overflow-hidden">

            {/* ── Full-bleed background ─────────────────────────────── */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://res.cloudinary.com/dsjzcazdi/image/upload/f_auto,q_auto/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp"
                    alt="Golan Heights landscape"
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/25" />
            </div>

            {/* ── Content Container (Standardized Max-Width) ────────── */}
            <div className="relative z-10 flex-1 flex flex-col items-center md:justify-center pt-24 md:pt-0 md:mt-20
                            w-full max-w-[1200px] lg:max-w-[1400px] px-4 mx-auto gap-4 mb-7
                            ">

                {/* Upper Text Section */}
                <Reveal>
                    <div className="flex flex-col items-center text-center gap-4 md:mt-0">
                        <div className="flex items-center gap-2 text-brand-yellow bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-sm md:text-base border border-white/10">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span>{dict.northenisrael}</span>
                        </div>

                        <h1 className="flex flex-col items-center gap-1 text-center">
                            <span className="text-4xl md:text-7xl font-bold text-shadow-lg text-white leading-tight">
                                {dict.heroTitleMain}
                            </span>
                            <span className="text-xl md:text-3xl font-bold text-shadow-lg text-brand-yellow leading-tight">
                                {dict.heroTitleSub}
                            </span>
                        </h1>

                        <p className="text-white/90 text-base md:text-xl max-w-[90%] md:max-w-[42rem] leading-relaxed">
                            {dict.herodes}
                        </p>


                        <div className="mt-4 flex w-full flex-col items-center justify-center gap-3 px-2">
                            <ScrollToExploreButton
                                className="group flex min-h-[48px] w-full max-w-[22rem] cursor-pointer items-center justify-center gap-2.5 rounded-full border border-brand-yellow/35 bg-[image:var(--brand-gradient)] px-7 py-3 text-base font-extrabold text-brand-blue shadow-xl shadow-emerald-950/30 transition-all hover:-translate-y-0.5 hover:bg-none hover:bg-brand-yellow-hover hover:shadow-emerald-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 active:translate-y-0 active:scale-[0.98] active:bg-brand-yellow-active sm:px-8 sm:text-lg"
                            >
                                <Compass className="h-[18px] w-[18px] shrink-0 text-brand-blue transition-transform group-hover:rotate-45" aria-hidden="true" />
                                <span>{dict.explorenow}</span>
                            </ScrollToExploreButton>

                            <Link
                                href={`/${lang}/history`}
                                className="group flex min-h-[48px] w-full max-w-[20rem] items-center justify-center gap-2.5 rounded-full border border-white/20 bg-black/25 px-6 py-3 text-base font-semibold text-white/85 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 active:translate-y-0 active:scale-[0.98]"
                            >
                                <BookOpen className="h-4 w-4 shrink-0 text-brand-yellow/90 transition-transform group-hover:text-brand-yellow" aria-hidden="true" />
                                <span>{dict.exploreHistoryCta}</span>
                            </Link>
                        </div>
                    </div>
                </Reveal>


                <div className="w-full flex justify-center items-center flex-col md:flex-row gap-4 ">

                    {/* Village Card */}
                    <div className="flex-1 w-full md:order-1">
                        <HeroInfoCard
                            icon={MapPin}
                            title={dict.herocards.villages}
                            description={dict.herocards.villagedesc}
                        />
                    </div>

                    {/* Weather Card (Center on Desktop, Top on Mobile) */}
                    <div className="flex-1 max-w-[350px] md:order-2 order-first min-w-[320px] md:min-w-0">
                        <WeatherCard lang={lang} />
                    </div>

                    {/* Hidden Gems Card */}
                    <div className="flex-1 w-full md:order-3">
                        <HeroInfoCard
                            icon={Mountain}
                            title={dict.herocards.hiddengems}
                            description={dict.herocards.hiddengemsdesc}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

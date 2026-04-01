import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin, Mountain } from "lucide-react";
import HeroInfoCard from "./Hero.infocard";
import WeatherCard from "./WeatherCard";

export default function AnimatedHero({ lang, dict }: { lang: string; dict: Record<string, any> }) {
    return (
        <section className="relative w-full min-h-[100svh] flex flex-col overflow-hidden">

            {/* ── Full-bleed background ─────────────────────────────── */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp"
                    alt="Golan Heights"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* ── Content (constrained to site grid) ───────────────────
                · max-w-[1200px] lg:max-w-[1400px] mx-auto px-4  ← matches all other sections
                · pt-16 md:pt-20                                  ← accounts for fixed navbar height
                · pb-10 gap-2 md:gap-3                            ← standard site rhythm             */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center
                            w-full max-w-[1200px] lg:max-w-[1400px] mx-auto
                            px-4 pt-16 md:pt-20 pb-10
                            gap-2 md:gap-3">

                {/* Location badge */}
                <div className="flex items-center gap-2 text-emerald-500 bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full font-bold text-sm md:text-base">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{dict.northenisrael}</span>
                </div>

                {/* Two-line heading */}
                <div className="flex flex-col items-center text-center gap-1">
                    <h1 className="text-2xl md:text-6xl font-bold font-serif text-white leading-tight">
                        {dict.explore}
                    </h1>
                    <h1 className="text-2xl md:text-6xl font-bold font-serif text-emerald-500 leading-tight">
                        {dict.golanheights}
                    </h1>
                </div>

                {/* Tagline */}
                <p className="text-center text-white text-base md:text-[1.3rem] max-w-[85%] md:max-w-[40rem]">
                    {dict.herodes}
                </p>

                {/* CTA — RTL/LTR preserved, glassmorphism intact */}
                <Link
                    href={`/${lang}/places`}
                    className="flex items-center justify-center gap-2 mt-1 px-5 py-2 bg-white/20 backdrop-blur-sm text-emerald-400 font-bold text-lg rounded-full shadow-lg hover:bg-white/30 transition-colors duration-200"
                >
                    {lang === 'ar' || lang === 'he'
                        ? <span className="flex items-center gap-2">{dict.explorenow} <Compass className="h-[85%] mt-0.5" /></span>
                        : <span className="flex items-center gap-2"><Compass className="h-[85%] mt-0.5" /> {dict.explorenow}</span>
                    }
                </Link>

                {/* ── Info cards — single responsive block ─────────────
                    Mobile  : column, Weather first (order-first)
                    Desktop : row, Weather centred (md:order-2)         */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-7 mt-2 md:mt-4 items-center ">
                    {/* Inside AnimatedHero.tsx */}
                    <div className="flex-1 md:order-2 order-first min-w-[300px]">
                        <WeatherCard lang={lang} />
                    </div>
                    <div className="w-full md:order-1">
                        <HeroInfoCard
                            icon={MapPin}
                            title={dict.herocards.villages}
                            description={dict.herocards.villagedesc}
                        />
                    </div>
                    <div className="w-full md:order-3">
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

import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin, Mountain } from "lucide-react";
import HeroInfoCard from "./Hero.infocard";
import WeatherCard from "./WeatherCard";

export default function AnimatedHero({ lang, dict }: { lang: string; dict: Record<string, any> }) {

    return (
        <section className="relative w-full min-h-[100dvh] flex flex-col overflow-hidden">

            {/* ── Full-bleed background ─────────────────────────────── */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp"
                    alt="Golan Heights"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/25" />
            </div>

            {/* ── Content Container (Standardized Max-Width) ────────── */}
            <div className="relative z-10 flex-1 flex flex-col items-center md:justify-center mt-25 md:mt-0
                            w-full w-[1200px] lg:max-w-[1400px] px-4 mx-auto gap-4 mb-7
                            ">

                {/* Upper Text Section */}
                <div className="flex flex-col items-center text-center gap-4 md:mt-0">
                    <div className="flex items-center gap-2 text-emerald-400 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-sm md:text-base border border-white/10">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{dict.northenisrael}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <h1 className="text-3xl md:text-7xl font-bold font-serif text-white leading-tight">
                            {dict.explore}
                        </h1>
                        <h1 className="text-3xl md:text-7xl font-bold font-serif text-emerald-500 leading-tight">
                            {dict.golanheights}
                        </h1>
                    </div>

                    <p className="text-white/90 text-base md:text-xl max-w-[90%] md:max-w-[42rem] leading-relaxed">
                        {dict.herodes}
                    </p>


                    <Link
                        href={`/${lang}/places`}
                        className="group flex items-center justify-center gap-3 mt-4 px-8 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-emerald-400 font-bold text-lg rounded-full shadow-xl border border-white/10 transition-all"
                    >
                        <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform mt-1" />
                        <span className="mt-1">{dict.explorenow}</span>
                    </Link>
                </div>


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
import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import HeroInfoCard from "./Hero.infocard";
import WeatherCard from "./WeatherCard";

export default function AnimatedHero({ lang, dict }: { lang: string; dict: Record<string, any> }) {
    return (
        /* 1. Added flex and flex-col to the main container */
        <div className="relative flex flex-col w-full min-h-[100svh] overflow-hidden box-border pb-10">

            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp"
                    alt="Hero"
                    fill
                    priority
                    className="object-cover"
                />
                {/* Moved the dark overlay here so it covers the background image */}
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* 2. TEXT CONTAINER: flex-1 makes it fill the space ABOVE the footer exactly */}
            <div className="relative z-10 flex-1 flex flex-col items-center md:justify-center w-full mt-25 md:mt-0 gap-1 md:gap-2">
                <div className=" flex items-center gap-2 text-emerald-300 bg-black/40 px-4 py-1 rounded-full font-bold text-md md:text-xl">
                    <MapPin />
                    <p >{dict.northenisrael}</p>
                </div>
                <h1 className="text-white text-2xl md:text-6xl font-bold font-serif text-center px-4">
                    {dict.explore}
                </h1>
                <h1 className="text-green-300 text-2xl md:text-6xl font-bold font-serif text-center px-4">
                    {dict.golanheights}
                </h1>
                <p className="text-center text-white text-[1rem] md:text-[1.3rem] max-w-[85%] md:max-w-[40rem]">{dict.herodes}</p>
                <Link
                    href={`/${lang}/places`}
                    className="flex text-lg items-center justify-center w-fit !mt-2 !px-5 !py-2 bg-white/20 backdrop-blur-sm text-emerald-300 font-bold rounded-full shadow-lg"
                >
                    {lang === 'ar' || lang === 'he' ? <span className="flex items-center gap-2">{dict.explorenow} <Compass className="h-[85%] mt-0.5" /></span> : <span className="flex items-center gap-2"><Compass className="h-[85%] mt-0.5" /> {dict.explorenow}</span>}
                </Link>
                <div className="hidden md:flex flex-col md:justify-center items-center md:flex-row gap-x-7 gap-y-2 w-full">


                    <HeroInfoCard
                        icon={MapPin}
                        title={dict.herocards.title}
                        description={dict.herocards.description}
                    />
                    <WeatherCard
                        lang={lang}

                    />
                    <HeroInfoCard
                        icon={MapPin}
                        title={dict.herocards.title}
                        description={dict.herocards.description}
                    />
                </div>
                <div className="flex md:hidden flex-col md:justify-center items-center md:flex-row gap-x-7 gap-y-2 w-full">
                    <WeatherCard
                        lang={lang}

                    />

                    <HeroInfoCard
                        icon={MapPin}
                        title={dict.herocards.title}
                        description={dict.herocards.description}
                    />
                    <HeroInfoCard
                        icon={MapPin}
                        title={dict.herocards.title}
                        description={dict.herocards.description}
                    />
                </div>
            </div>



            {/* 3. FOOTER: Removed absolute positioning. It now sits naturally at the bottom. */}

        </div>
    );
}
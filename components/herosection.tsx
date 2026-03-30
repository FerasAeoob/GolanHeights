import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin } from "lucide-react";

export default function AnimatedHero({ lang, dict }: { lang: string; dict: Record<string, any> }) {
    return (
        /* 1. Added flex and flex-col to the main container */
        <div className="relative flex flex-col w-full h-screen overflow-hidden box-border">

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
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
                <div className="flex items-center gap-2 text-emerald-300 bg-black/70 px-4 py-1 rounded-full font-bold text-xl">
                    <MapPin />
                    <p >{dict.northenisrael}</p>
                </div>
                <h1 className="text-white text-4xl md:text-6xl font-bold font-serif text-center px-4 my-1">
                    {dict.explore}
                </h1>
                <h1 className="text-green-300 text-4xl md:text-6xl font-bold font-serif text-center px-4">
                    {dict.golanheights}
                </h1>
                <p className="text-center text-white text-[1.3rem] max-w-[75%] md:max-w-[40rem]">{dict.herodes}</p>
                <Link
                    href={`/${lang}/places`}
                    className="flex text-lg items-center justify-center w-fit !mt-2 !px-5 !py-2 bg-white/20 backdrop-blur-sm text-emerald-300 font-bold rounded-full shadow-lg"
                >
                    {lang === 'ar' || lang === 'he' ? <span className="flex items-center gap-2">{dict.explorenow} <Compass className="h-[85%] mt-0.5" /></span> : <span className="flex items-center gap-2"><Compass className="h-[85%] mt-0.5" /> {dict.explorenow}</span>}
                </Link>
            </div>

            {/* 3. FOOTER: Removed absolute positioning. It now sits naturally at the bottom. */}
            <div className="relative z-10 w-full bg-stone-900/50 backdrop-blur-md py-4 md:py-6 border-t-2 border-white/40">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 max-w-6xl mx-auto text-white">

                    {/* Stat 1 */}
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold">50+</span>
                        <span className="text-xs md:text-sm font-light text-gray-200 mt-1">{dict.stat_attractions}</span>
                    </div>

                    {/* Stat 2 */}
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold">20+</span>
                        <span className="text-xs md:text-sm font-light text-gray-200 mt-1">{dict.stat_trails}</span>
                    </div>

                    {/* Stat 3 */}
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold">15+</span>
                        <span className="text-xs md:text-sm font-light text-gray-200 mt-1">{dict.stat_wineries}</span>
                    </div>

                    {/* Stat 4 */}
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold">1000m</span>
                        <span className="text-xs md:text-sm font-light text-gray-200 mt-1">{dict.stat_elevation}</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
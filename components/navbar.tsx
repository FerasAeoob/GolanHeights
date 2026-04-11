'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import NavbarButtons from "@/components/navbar.buttons";
import Image from "next/image";
import MobileDrawer from "@/components/layout/MobileDrawer";


export default function Navbar({ lang, dict, currentUser }: { lang: string; dict: Record<string, any>; currentUser: any }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 start-0 w-full z-50 h-16 md:h-20 flex items-center justify-center transition-all duration-300
          border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]`}
        >
            {/* Background Layer with Blur (Separate to avoid trapping fixed children) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />

            <div className="flex justify-between items-center w-full lg:max-w-[1400px] max-w-[1200px] px-4 h-full relative">
                <div>
                    <Link href={`/${lang}`} className="flex items-center font-bold gap-3">
                        <Image src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1775083745/output-onlinepngtools_aw183f.webp" alt="Logo" width={90} height={75} className="" />
                        <h1 className="text-2xl font-bold font-outfit bg-[radial-gradient(circle,_#f2dbb6_40%,_#e8bf82_60%,_#d4a968_100%)] bg-clip-text text-transparent hidden md:block">Golan WIKI</h1>
                    </Link>
                </div>
                <div className="flex flex-row items-center gap-2 md:gap-4">
                    <div className="flex flex-row ">
                        <NavbarButtons dict={dict} lang={lang} />
                    </div>

                    {/* Mobile Menu Integration */}
                    <MobileDrawer lang={lang} dict={dict} currentUser={currentUser} />
                </div>
            </div>

        </header >
    );
}
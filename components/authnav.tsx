'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import NavbarButtons from "@/components/navbar.buttons";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HamburgerMenu from "@/components/hamburger.menu";


export default function Navbar({ lang, dict }: { lang: string; dict: Record<string, any> }) {
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
        ${scrolled ? "bg-white/5 backdrop-blur-sm py-4 md:py-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]" : "bg-transparent"}`}
        >
            <div className="flex justify-between items-center w-full lg:max-w-[1400px] max-w-[1200px] px-4  ">
                <div>
                    <Link href={`/${lang}`} className="flex items-center font-bold gap-3">
                        <Image src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1775083745/output-onlinepngtools_aw183f.webp" alt="Logo" width={90} height={75} className="" />
                        <h1 className="text-2xl font-bold text-emerald-700 hidden md:block">Golan WIKI</h1>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />

                </div>
            </div>

        </header>
    );
}
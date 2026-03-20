'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
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
            className={`fixed top-0 left-0 w-full z-50 h-16 md:h-20 flex items-center justify-center transition-all duration-300
        ${scrolled ? "bg-white/5 backdrop-blur-sm py-4 md:py-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]" : "bg-transparent"}`}
        >
            <div className="flex justify-between items-center w-full lg:max-w-[1400px] max-w-[1200px] p-2 sm:p-1  ">
                <Link href="/" className="flex items-center gap-2 font-bold md:p-3 sm:p-2 p-1">
                    <Image src="/logox.png" alt="Logo" width={32} height={32} />
                    Golan Heights
                </Link>
            </div>

        </header>
    );
}
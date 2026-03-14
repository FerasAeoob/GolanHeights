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
        ${scrolled ? "bg-white py-4 md:py-6 drop-shadow-lg" : "bg-transparent"}`}
        >
            <div className="flex justify-between items-center w-full lg:max-w-[1400px] max-w-[1200px] p-2 sm:p-1  ">
                <Link href="/" className="flex items-center gap-2 font-bold md:p-3 sm:p-2 p-1">
                    <Image src="/globe.svg" alt="Logo" width={32} height={32} />
                    Acme
                </Link>
            </div>

        </header>
    );
}
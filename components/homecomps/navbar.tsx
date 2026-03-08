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
            className={`fixed top-0 left-0 w-full z-50 h-12 sm:h-16 flex items-center px-6 transition-all duration-300
      ${scrolled ? "bg-stone-900/20 backdrop-blur-md py-4 md:py-6" : "bg-transparent"}`}
        >
            <Link href="/" className="flex items-center gap-2 font-bold">
                <Image src="/globe.svg" alt="Logo" width={32} height={32} />
                Acme
            </Link>
        </header>
    );
}
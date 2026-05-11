'use client';
import Link from "next/link";
import Image from "next/image";
import MobileDrawer from "@/components/layout/MobileDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";


export default function Navbar({ lang, dict, currentUser }: { lang: string; dict: Record<string, any>; currentUser: any }) {

    return (
        <header
            className={`fixed top-0 start-0 w-full z-50 h-16 md:h-20 flex items-center justify-center transition-all duration-300
          border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]`}
        >
            {/* Background Layer with Blur (Separate to avoid trapping fixed children) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />

            <div className="flex justify-between items-center w-full lg:max-w-[1400px] max-w-[1200px] px-4 h-full relative">
                <div className="">
                    <Link href={`/${lang}`} className="flex items-center font-bold gap-3">
                        <Image src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1778314889/Untitled_design-Photoroom_wcyhzr.png"
                            alt="Golan Wiki logo"
                            width={60}
                            height={45}
                            quality={85} />
                        <span className="text-2xl font-bold font-outfit bg-[radial-gradient(circle,_#FFFDA3_40%,_#F7F57C_60%,_#F0ED59_100%)] bg-clip-text text-transparent hidden md:block">Golan Wiki</span>
                    </Link>
                </div>
                <div className="flex flex-row items-center gap-2 md:gap-4">
                    <div className="flex flex-row ">
                        <LanguageSwitcher />
                    </div>

                    {/* Mobile Menu Integration */}
                    <MobileDrawer lang={lang} dict={dict} currentUser={currentUser} />
                </div>
            </div>

        </header >
    );
}
import Link from "next/link";
import { House, UserRound } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function NavbarButtons({ dict, lang }: { dict: Record<string, any>; lang: string }) {
    return (
        <div className="flex  flex-row items-center gap-4">



            <Link href={`/${lang}/login`} className=" text-white rounded-md px-2 py-2 cursor-pointer" ><UserRound className="text-white" /></Link>
            <LanguageSwitcher />
        </div>
    );
}
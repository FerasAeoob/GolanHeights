import Link from "next/link";

export default function NavbarButtons({ dict, lang }: { dict: Record<string, any>; lang: string }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <Link href={`/${lang}`} className=" text-white bg-black/40 backdrop-blur-md rounded-md px-4 py-2 cursor-pointer" >{dict.home}</Link>

            <Link href={`/${lang}/places`} className=" text-white bg-black/40 backdrop-blur-md rounded-md px-4 py-2 cursor-pointer" >{dict.explore}</Link>

            <Link href={`/${lang}/about`} className=" text-white bg-black/40 backdrop-blur-md rounded-md px-4 py-2 cursor-pointer" >{dict.aboutus}</Link>
        </div>
    );
}
import { getDictionary } from "@/lib/get-dictionary";
import Image from "next/image";

export default async function Area51SecPage({
    params,
}: {
    params: Promise<{ lang: 'en' | 'ar' | 'he' }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <section className="flex flex-col md:h-[25rem] h-[20rem] bg-emerald-700  ">

            <div className="flex flex-col h-full mb-8 mt-10 mx-auto  w-full max-w-[1200px] lg:max-w-[1400px] justify-center gap-4 px-4">
                {/* Headers */}

                <h3 className="  uppercase font-bold text-3xl md:text-4xl text-white">
                    {dict.exploreplaces}
                </h3>
                <h2 className="text-xl  md:text-2xl text-white/80 ">
                    {dict.exploreplacesdesc}
                </h2>
            </div>

        </section>
    );
}


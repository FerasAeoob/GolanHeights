import type { Metadata } from "next";
import "@/app/globals.css";
import Authnav from "@/components/authnav";

import { getDictionary } from "@/lib/get-dictionary"; // ADDED

export const metadata: Metadata = {
    title: "Golan Heights Guide",
    description: "Discover the best places in the Golan Heights",
};

export default async function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const locale = lang as 'en' | 'ar' | 'he';
    const dict = await getDictionary(locale);
    return (
        <>
            <Authnav dict={dict} lang={lang} />

            <main className="flex-grow">
                {children}
            </main>

        </>
    );
}
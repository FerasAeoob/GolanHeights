import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import { Locale } from "@/lib/get-dictionary";

export const metadata: Metadata = {
    title: "Golan Heights Guide",
    description: "Discover the best places in the Golan Heights",
};

// app/layout.tsx

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang?: string }>;
}) {
    const resolvedParams = await params;

    const lang = resolvedParams.lang || "";

    const currentLang = (lang === 'ar' || lang === 'he') ? lang : 'en';

    const direction = currentLang === "ar" || currentLang === "he" ? "rtl" : "ltr";

    return (
        <html lang={currentLang} dir={direction}>
            <head />
            {/* 1. Added flex, flex-col, and min-h-screen to the body */}
            <body className="flex flex-col min-h-screen">
                <Navbar />

                {/* 2. Added flex-grow so this area fills all available space */}
                <main className="flex-grow mb-50">
                    {children}
                </main>

                <Footer />
            </body>
        </html>
    );
}
import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Golan Heights Guide",
    description: "Discover the best places in the Golan Heights",
};

// app/layout.tsx

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
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
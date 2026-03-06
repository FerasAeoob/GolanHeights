// app/layout.tsx

import type { Metadata } from "next";
import "../globals.css"; // your global styles
import Navbar from "@/components/homecomps/navbar";

export const metadata: Metadata = {
    title: "Golan Heights Guide",
    description: "Discover the best places in the Golan Heights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head />
            <body>
                <div>
                    <Navbar />
                </div>

                {children}
            </body>
        </html>
    );
}
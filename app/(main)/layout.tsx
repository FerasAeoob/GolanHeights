// app/layout.tsx
import React from "react";
import "../globals.css"; // your global styles
import Navbar from "@/components/home/navbar";

export const metadata = {
    title: "Golan Heights Guide",
    description: "Discover the best places in the Golan Heights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head />
            <body>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
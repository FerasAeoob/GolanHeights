// app/layout.tsx
import React from "react";
import "../globals.css"; // your global styles

export const metadata = {
    title: "Golan Heights Guide",
    description: "Discover the best places in the Golan Heights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head />
            <body>
                {/* Header */}
                <header className="bg-gray-800 text-white p-4 shadow-md">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-bold">Golan Heights</h1>
                        <nav>
                            <ul className="flex gap-4">
                                <li><a href="/">Home</a></li>
                                <li><a href="/places">Places</a></li>
                                <li><a href="/about">About</a></li>
                            </ul>
                        </nav>
                    </div>
                </header>

                {/* Main content */}
                <main className="max-w-7xl mx-auto p-4">{children}</main>

                {/* Footer */}
                <footer className="bg-gray-800 text-white p-4 mt-8">
                    <div className="max-w-7xl mx-auto text-center">
                        &copy; {new Date().getFullYear()} Golan Heights Guide. All rights reserved.
                    </div>
                </footer>
            </body>
        </html>
    );
}
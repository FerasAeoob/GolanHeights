'use client';


import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <header className="flex h-16 items-center border-b bg-background px-4 md:px-6">
            <nav className="flex items-center gap-6 text-lg font-medium">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold md:text-base"
                >
                    <Image src="../public/globe.svg" alt="Logo" width={50} height={50} />
                    <span className="font-bold">Acme Inc</span>
                </Link>
            </nav>
        </header>

    );
}
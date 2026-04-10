'use client';
import NavbarButtons from "@/components/navbar.buttons";
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';


export default function HamburgerMenu({ dict, lang }: { dict: Record<string, any>; lang: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Close menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <div className="flex md:hidden items-center">
            <button
                onClick={toggleMenu}
                className="text-white bg-emerald-700/80 rounded-lg p-2 focus:outline-none z-[60] relative transition-colors hover:bg-emerald-600/80"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/95 z-70 flex flex-col items-center justify-center gap-8 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            >


            </div>
        </div>
    );
}

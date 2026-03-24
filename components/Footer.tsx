
import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

export default function Footer({ lang, dict }: { lang: string; dict: Record<string, any> }) {
  return (
    <footer className="bg-zinc-950 text-zinc-300 py-16 border-t border-zinc-900 mt-20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 mb-12">
          {/* Brand & Description */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {dict.golanheights}<span className="text-emerald-500">.</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed max-w-sm">
              {dict.footerdesc}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-zinc-900 hover:bg-emerald-500 hover:text-white transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-zinc-900 hover:bg-emerald-500 hover:text-white transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-zinc-900 hover:bg-emerald-500 hover:text-white transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">{dict.quicklinks}</h3>
            <ul className="space-y-3">
              {[
                { name: dict.home, href: `/${lang}` },
                { name: dict.destinations, href: `/${lang}/places` },
                { name: dict.tours, href: `/${lang}/tours` },
                { name: dict.aboutus, href: `/${lang}/about` },
                { name: dict.contact, href: `/${lang}/contact` },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-emerald-400 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">{dict.contactus}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-400">{dict.address1}<br />{dict.address2}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-zinc-400" dir="ltr">+972 50 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-zinc-400">info@golanheights.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">
            {dict.rights.replace('{year}', new Date().getFullYear().toString())}
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href={`/${lang}/privacy`} className="hover:text-emerald-400 transition-colors">{dict.privacypolicy}</Link>
            <Link href={`/${lang}/terms`} className="hover:text-emerald-400 transition-colors">{dict.termsofservice}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

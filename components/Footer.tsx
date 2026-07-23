import Link from "next/link";
import {
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function Footer({
  lang,
  dict,
}: {
  lang: string;
  dict: Record<string, any>;
}) {
  const isRtl = lang === "ar" || lang === "he";
  const year = new Date().getFullYear().toString();

  const path = (href: string) => {
    if (href === "/") {
      return lang === "en" ? "/" : `/${lang}`;
    }

    return lang === "en" ? href : `/${lang}${href}`;
  };

  const quickLinks = [
    { name: dict.home, href: path("/") },
    { name: dict.destinations, href: path("/places") },
    { name: dict.nav?.history || "History", href: path("/history") },
    { name: dict.aboutus, href: path("/about") },
    { name: dict.contact, href: path("/contact") },
  ];

  const legalLinks = [
    { name: dict.privacypolicy, href: path("/privacy-policy") },
    {
      name: dict.termsofuse ?? dict.termsofservice,
      href: path("/terms-of-use"),
    },
    { name: dict.cookiepolicy, href: path("/cookie-policy") },
  ];

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="border-t border-zinc-900 bg-zinc-950 text-zinc-300"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-12 lg:py-14">
        {/* Main Footer */}
        <div className="flex flex-col items-center justify-center gap-12 text-center lg:flex-row lg:items-start lg:gap-24 xl:gap-32">
          {/* Brand */}
          <div className="flex w-full max-w-sm flex-col items-center justify-center text-center">
            <Link
              href={path("/")}
              dir="ltr"
              className="inline-flex items-center justify-center text-2xl font-bold tracking-tight text-white"
            >
              <span>Golan Wiki</span>
              <span className="text-emerald-500">.</span>
            </Link>

            <p className="mt-4 max-w-sm text-center text-sm leading-7 text-zinc-400">
              {dict.footerdesc}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <a
                href="https://www.instagram.com/golanwiki"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white hover:ring-emerald-500"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex w-full max-w-xs flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-white">
              {dict.quicklinks}
            </h3>

            <ul className="mt-5 flex flex-col items-center justify-center gap-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center justify-center gap-2 text-sm text-zinc-400 transition-colors duration-200 hover:text-emerald-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 transition-colors duration-200 group-hover:bg-emerald-400" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex w-full max-w-sm flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-white">
              {dict.contactus}
            </h3>

            <ul className="mt-5 flex flex-col items-center justify-center gap-3">
              <li className="flex items-center justify-center gap-3 text-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <MapPin className="h-4 w-4" />
                </span>

                <span className="text-sm align-center justify-center leading-6 text-zinc-400">
                  {dict.address1}.
                </span>
              </li>

              {/* <li className="flex items-center justify-center gap-3 text-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Phone className="h-4 w-4" />
                </span>

                <a
                  href="tel:+972501234567"
                  dir="ltr"
                  className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                >
                  +972 50 123 4567
                </a>
              </li> */}

              <li className="flex items-center justify-center gap-3 text-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Mail className="h-4 w-4" />
                </span>

                <a
                  href="mailto:support@golanwiki.com"
                  dir="ltr"
                  className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                >
                  support@golanwiki.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mx-auto mt-12 max-w-5xl border-t border-zinc-900 pt-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-zinc-500">
              {dict.rights.replace("{year}", year)}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm text-zinc-500">
              {legalLinks.map((link, index) => (
                <div key={link.href} className="flex items-center">
                  <Link
                    href={link.href}
                    className="px-2 transition-colors duration-200 hover:text-emerald-400"
                  >
                    {link.name}
                  </Link>

                  {index < legalLinks.length - 1 && (
                    <span className="text-zinc-700">/</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

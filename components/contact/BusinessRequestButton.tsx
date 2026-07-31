"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface BusinessRequestButtonProps {
  lang: string;
  label: string;
  isRtl: boolean;
}

export default function BusinessRequestButton({
  lang,
  label,
  isRtl,
}: BusinessRequestButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Build the canonical path so the URL is always correct.
    const path =
      lang === "en"
        ? "/contact?reason=add"
        : `/${lang}/contact?reason=add`;

    // Replace the URL without triggering Next.js scroll restoration.
    router.replace(path, { scroll: false });

    // Notify the ContactForm to switch its select value immediately.
    window.dispatchEvent(
      new CustomEvent("contact-reason-change", { detail: { reason: "add" } })
    );

    // Wait one frame so the URL replacement settles before scrolling.
    requestAnimationFrame(() => {
      document
        .getElementById("contact-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-white px-8 py-5 text-sm font-bold text-zinc-950 transition-all hover:bg-brand-yellow active:scale-[0.98]"
    >
      <span>{label}</span>

      <ArrowRight
        className={`h-4 w-4 transition-transform ${isRtl
            ? "rotate-180 group-hover:-translate-x-1"
            : "group-hover:translate-x-1"
          }`}
      />
    </button>
  );
}

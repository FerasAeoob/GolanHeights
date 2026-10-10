import { MessageCircle } from "lucide-react";
import { getStayWhatsAppLink } from "@/lib/stay-whatsapp";

interface StayWhatsAppButtonProps {
  category?: string;
  whatsapp?: string;
  label: string;
}

export default function StayWhatsAppButton({ category, whatsapp, label }: StayWhatsAppButtonProps) {
  const href = getStayWhatsAppLink(category, whatsapp);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-2.5 text-center text-sm font-semibold leading-relaxed text-white shadow-md transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 motion-reduce:transition-none"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0">{label}</span>
    </a>
  );
}

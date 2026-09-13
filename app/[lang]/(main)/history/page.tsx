import type { Metadata } from "next";
import HistoryStoryScroll from "@/components/history/HistoryStoryScroll";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/get-dictionary";
import { getLocalizedPathname } from "@/utils/navigation";

type HistoryPageProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateMetadata({
  params,
}: HistoryPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.history?.metaTitle,
    description: dict.history?.metaDescription,
    alternates: {
      canonical: `https://www.golanwiki.com${getLocalizedPathname("/history", lang, "", "")}`,
      languages: {
        en: `https://www.golanwiki.com${getLocalizedPathname("/history", "en", "", "")}`,
        he: `https://www.golanwiki.com${getLocalizedPathname("/history", "he", "", "")}`,
        ar: `https://www.golanwiki.com${getLocalizedPathname("/history", "ar", "", "")}`,
        "x-default": `https://www.golanwiki.com${getLocalizedPathname("/history", "en", "", "")}`,
      },
    },
  };
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main className="min-h-screen w-full bg-zinc-950 pt-16 md:pt-20">
      <HistoryStoryScroll history={dict.history} lang={lang} />
    </main>
  );
}

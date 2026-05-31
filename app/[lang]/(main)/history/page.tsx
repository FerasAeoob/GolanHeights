import type { Metadata } from "next";
import HistoryStoryScroll from "@/components/history/HistoryStoryScroll";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/get-dictionary";

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
      canonical: `https://www.golanwiki.com/${lang}/history`,
      languages: {
        en: "https://www.golanwiki.com/en/history",
        he: "https://www.golanwiki.com/he/history",
        ar: "https://www.golanwiki.com/ar/history",
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

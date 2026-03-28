import type { Metadata } from "next";
import { Outfit, Rubik, Cairo } from "next/font/google";
import "@/app/globals.css";
import { PostHogProvider } from "@/app/providers";
import { PostHogPageView } from "@/app/pageview";
import { Suspense } from "react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "hebrew"],
  display: 'swap',
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Golan Heights Guide",
  description: "Discover the best places in the Golan Heights",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const locale = lang as 'en' | 'ar' | 'he';
  const dir = locale === "ar" || locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} >
      <body
        className={`${outfit.variable} ${rubik.variable} ${cairo.variable} antialiased flex flex-col min-h-screen`}
      >
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}

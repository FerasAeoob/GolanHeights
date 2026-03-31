import type { Metadata } from "next";
import { Outfit, Heebo, Tajawal } from "next/font/google";
import "@/app/globals.css";
import { PostHogProvider } from "@/app/providers";
import { PostHogPageView } from "@/app/pageview";
import { Suspense } from "react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  display: 'swap',
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["latin", "arabic"],
  weight: ['400', '500', '700'],
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

  let fontClass = "font-sans";
  if (locale === "en") fontClass = "font-outfit";
  if (locale === "he") fontClass = "font-heebo";
  if (locale === "ar") fontClass = "font-tajawal";

  return (
    <html lang={lang} dir={dir} >
      <body
        className={`${outfit.variable} ${heebo.variable} ${tajawal.variable} ${fontClass} antialiased flex flex-col min-h-screen`}
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

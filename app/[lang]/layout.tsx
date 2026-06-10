import type { Metadata } from "next";
import { Outfit, Heebo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "@/app/globals.css";
import { PostHogProvider } from "@/app/providers";
import { LocalizedSlugProvider } from "@/app/LocalizedSlugContext";
import { PostHogPageView } from "@/app/pageview";
import { Suspense } from "react";
import ToastContainer from "@/components/ui/Toast";


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

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-font",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.golanwiki.com'),
  title: {
    template: "%s | Golan Wiki",
    default: "Golan Wiki",
  },
  applicationName: "Golan Wiki",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Golan Wiki",
  },
  description: "Discover the best places in the Golan Heights",
  icons: {
    apple: "/logox.png",
    icon: "/logox.png",
    shortcut: "/logox.png",
  },
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
  if (locale === "ar") fontClass = "font-arabic";

  return (
    <html lang={lang} dir={dir} >
      <body
        className={`${outfit.variable} ${heebo.variable} ${ibmPlexSansArabic.variable} ${fontClass} antialiased flex flex-col min-h-screen`}
      >
        <PostHogProvider>
          <LocalizedSlugProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <ToastContainer />
            {children}
          </LocalizedSlugProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}

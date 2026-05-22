import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Preview | Golan Heights",
  description: "Please enter the access code to view the website.",
};

export default function LockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}

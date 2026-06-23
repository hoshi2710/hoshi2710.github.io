import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StarField } from "@/components/StarField";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  metadataBase: new URL(siteConfig.url),
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen text-slate-900 antialiased dark:text-slate-100`}
      >
        <StarField />
        <div className="mx-auto my-0 min-h-screen max-w-6xl border-x border-slate-200/70 bg-slate-50/45 dark:border-white/[0.06] dark:bg-[#0f1117]/35">
          <Header />
          <main className="mx-auto min-h-screen max-w-5xl px-5 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

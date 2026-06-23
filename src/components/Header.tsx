import Link from "next/link";
import { Sparkle } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1117]/80">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5"
        aria-label="주요 내비게이션"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-950 dark:text-slate-100"
        >
          <Sparkle className="h-4 w-4 fill-violet-500 text-violet-500" />
          <span>{siteConfig.name}</span>
        </Link>
        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-6 text-sm text-slate-600 dark:text-slate-300 sm:flex">
            {navItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="transition hover:text-violet-600 dark:hover:text-violet-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </nav>
      <div className="mx-auto flex max-w-5xl gap-4 overflow-x-auto px-5 pb-4 text-sm text-slate-600 dark:text-slate-300 sm:hidden">
        {navItems.map((item) => (
          <Link
            key={`${item.href}-${item.label}-mobile`}
            href={item.href}
            className="shrink-0 transition hover:text-violet-600 dark:hover:text-violet-300"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

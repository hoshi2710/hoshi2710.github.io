import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-slate-50/70 dark:border-white/[0.08] dark:bg-[#0f1117]/70">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-5 py-8 text-xs text-slate-500 dark:text-slate-500">
        © 2026 {siteConfig.author}
      </div>
    </footer>
  );
}

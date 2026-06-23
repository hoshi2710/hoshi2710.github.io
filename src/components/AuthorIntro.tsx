import Link from "next/link";
import { Github, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function AuthorIntro() {
  return (
    <section className="rounded-lg border border-slate-200/80 bg-white/55 p-6 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
      <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">
        {siteConfig.author}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
        백엔드, 인프라, OCR 프로젝트를 진행하며 얻은 시행착오와 구현 과정을
        정리합니다. 과한 감성보다 문제와 해결 과정을 명확히 남기는 것을 목표로
        합니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
        <Link
          href={siteConfig.social.github}
          className="inline-flex items-center gap-2 transition hover:text-violet-600 dark:hover:text-violet-300"
        >
          <Github className="h-4 w-4" /> GitHub
        </Link>
        <Link
          href={`mailto:${siteConfig.social.email}`}
          className="inline-flex items-center gap-2 transition hover:text-violet-600 dark:hover:text-violet-300"
        >
          <Mail className="h-4 w-4" /> Email
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Github, Mail } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { getLatestPosts, getTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

const projects = [
  ["SDVX OCR", "Python, OpenCV"],
  ["LMS 시스템", "JSP, MySQL"],
  ["UDP File Transfer", "C, WinSock"],
];

export default function HomePage() {
  const latestPosts = getLatestPosts(4);
  const tags = getTags().slice(0, 8);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
      <section className="min-w-0">
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            최근 글
          </h1>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/55 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Link
            href="/blog"
            className="text-sm font-medium text-violet-600 transition hover:text-violet-500 dark:text-violet-300"
          >
            전체 글 보기 →
          </Link>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-lg border border-slate-200/80 bg-white/55 p-5 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
            소개
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {siteConfig.description}
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <Link
              href={siteConfig.social.github}
              className="flex items-center gap-2 transition hover:text-violet-600 dark:hover:text-violet-300"
            >
              <Github className="h-4 w-4" /> GitHub
            </Link>
            <Link
              href={`mailto:${siteConfig.social.email}`}
              className="flex items-center gap-2 transition hover:text-violet-600 dark:hover:text-violet-300"
            >
              <Mail className="h-4 w-4" /> Email
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200/80 bg-white/55 p-5 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
            태그
          </h2>
          <div className="mt-4 space-y-2 text-sm">
            {tags.map((tag, index) => (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag)}`}
                className="flex items-center justify-between text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
              >
                <span>{tag}</span>
                <span className="text-xs text-slate-400">{12 - index}</span>
              </Link>
            ))}
          </div>
          <Link
            href="/blog"
            className="mt-4 inline-flex text-sm font-medium text-violet-600 dark:text-violet-300"
          >
            모든 태그 보기
          </Link>
        </section>

        <section className="rounded-lg border border-slate-200/80 bg-white/55 p-5 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
            최근 프로젝트
          </h2>
          <div className="mt-4 space-y-4">
            {projects.map(([title, stack]) => (
              <Link key={title} href="/portfolio" className="block text-sm">
                <strong className="block font-medium text-slate-900 dark:text-slate-200">
                  {title}
                </strong>
                <span className="mt-1 block text-slate-500 dark:text-slate-500">
                  {stack}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

import Link from "next/link";
import { formatPostDate, type Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group border-b border-slate-200/80 px-5 py-6 transition hover:bg-slate-100/50 dark:border-white/[0.08] dark:hover:bg-white/[0.025]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-base font-semibold tracking-tight text-slate-950 transition group-hover:text-violet-600 dark:text-slate-100 dark:group-hover:text-violet-300">
              {post.title}
            </h2>
          </Link>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            {post.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag)}`}
                className="rounded-md bg-slate-200/70 px-2 py-0.5 text-xs text-slate-600 transition hover:text-violet-600 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:text-violet-300"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
        <time className="shrink-0 text-xs text-slate-500 dark:text-slate-500">
          {formatPostDate(post.date)
            .replace(/년 |월 /g, ".")
            .replace("일", "")}
        </time>
      </div>
    </article>
  );
}

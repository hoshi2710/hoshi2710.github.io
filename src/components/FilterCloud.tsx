import Link from "next/link";

export function FilterCloud({
  categories,
  tags,
}: {
  categories: string[];
  tags: string[];
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-slate-200/80 bg-white/55 p-5 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
          카테고리
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/blog/category/${encodeURIComponent(category)}`}
              className="flex justify-between text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
            >
              <span>{category}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-slate-200/80 bg-white/55 p-5 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
          태그
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="rounded-md bg-slate-200/70 px-2 py-1 text-xs text-slate-600 transition hover:text-violet-600 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:text-violet-300"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}

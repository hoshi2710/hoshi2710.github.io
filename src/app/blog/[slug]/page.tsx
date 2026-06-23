import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ChevronLeft } from "lucide-react";
import { GiscusComments } from "@/components/comments/GiscusComments";
import {
  formatPostDate,
  getAllPosts,
  getPostBySlug,
  getPostSlugs,
} from "@/lib/posts";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getAllPosts().find((item) => item.slug === slug);

  if (!post) {
    return { title: "게시글을 찾을 수 없음" };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!getPostSlugs().includes(slug)) {
    notFound();
  }

  const post = getPostBySlug(slug);

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-violet-600 dark:hover:text-violet-300"
      >
        <ChevronLeft className="h-4 w-4" /> 목록으로
      </Link>
      <header className="border-b border-slate-200/80 pb-8 dark:border-white/[0.08]">
        <Link
          href={`/blog/category/${encodeURIComponent(post.category)}`}
          className="text-sm font-medium text-violet-600 dark:text-violet-300"
        >
          {post.category}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          {post.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <time>{formatPostDate(post.date)}</time>
          {post.readingTime && <span>{post.readingTime}</span>}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="rounded-md bg-slate-200/70 px-2 py-1 text-xs text-slate-600 transition hover:text-violet-600 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:text-violet-300"
            >
              {tag}
            </Link>
          ))}
        </div>
      </header>
      <div className="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-8 prose-a:font-medium dark:prose-invert">
        <MDXRemote source={post.content} />
      </div>
      <GiscusComments />
    </article>
  );
}

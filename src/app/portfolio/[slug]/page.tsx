import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ChevronLeft, ExternalLink } from "lucide-react";
import {
  getProjectBySlug,
  getProjectDetailBySlug,
  getProjectSlugs,
} from "@/lib/projects";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "프로젝트를 찾을 수 없음" };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectDetailBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/portfolio"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-violet-600 dark:hover:text-violet-300"
      >
        <ChevronLeft className="h-4 w-4" /> 프로젝트 목록으로
      </Link>

      <header className="border-b border-slate-200/80 pb-8 dark:border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-2 text-sm text-violet-600 dark:text-violet-300">
          <span>Project</span>
          {project.featured ? <span>· 대표 프로젝트</span> : null}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">
          {project.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <span
              key={item}
              className="rounded-md bg-slate-200/70 px-2 py-1 text-xs text-slate-600 dark:bg-white/[0.06] dark:text-slate-400"
            >
              {item}
            </span>
          ))}
        </div>

        {(project.repositoryUrl || project.demoUrl) && (
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {project.repositoryUrl ? (
              <Link
                href={project.repositoryUrl}
                className="inline-flex items-center gap-1 text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
              >
                Repository <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            {project.demoUrl ? (
              <Link
                href={project.demoUrl}
                className="inline-flex items-center gap-1 text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
              >
                Demo <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
        )}
      </header>

      <div className="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-8 prose-a:font-medium dark:prose-invert">
        <MDXRemote source={project.content} />
      </div>
    </article>
  );
}

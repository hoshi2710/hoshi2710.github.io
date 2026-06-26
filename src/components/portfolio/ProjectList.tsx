"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/projects";

type ProjectListProps = {
  projects: Project[];
};

export function ProjectList({ projects }: ProjectListProps) {
  const [showAll, setShowAll] = useState(false);
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects = showAll ? projects : featuredProjects;
  const hiddenProjectCount = projects.length - featuredProjects.length;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/55 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4 dark:border-white/[0.08]">
        <div>
          <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
            {showAll ? "전체 프로젝트" : "대표 프로젝트"}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            {showAll
              ? `${projects.length}개의 프로젝트를 모두 표시합니다.`
              : `대표로 설정한 ${featuredProjects.length}개의 프로젝트만 표시합니다.`}
          </p>
        </div>
        {hiddenProjectCount > 0 ? (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="shrink-0 rounded-md border border-slate-200/80 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100/70 hover:text-slate-950 dark:border-white/[0.08] dark:text-slate-400 dark:hover:border-white/[0.16] dark:hover:bg-white/[0.06] dark:hover:text-slate-100"
            aria-expanded={showAll}
          >
            {showAll ? "대표만 보기" : `전체보기 ${hiddenProjectCount}`}
          </button>
        ) : null}
      </div>

      {visibleProjects.map((project) => (
        <article
          key={project.slug}
          className="border-b border-slate-200/80 p-5 last:border-b-0 dark:border-white/[0.08]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/portfolio/${project.slug}`}
              className="text-base font-semibold tracking-tight text-slate-950 transition hover:text-violet-600 dark:text-slate-100 dark:hover:text-violet-300"
            >
              {project.title}
            </Link>
            {project.featured ? (
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:text-cyan-300">
                대표
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {project.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-slate-200/70 px-2 py-1 text-xs text-slate-600 dark:bg-white/[0.06] dark:text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>
            <Link
              href={`/portfolio/${project.slug}`}
              className="text-xs font-medium text-violet-600 transition hover:text-violet-500 dark:text-violet-300"
            >
              자세히 보기 →
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}

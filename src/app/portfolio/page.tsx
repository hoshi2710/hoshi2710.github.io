import { AuthorIntro } from "@/components/AuthorIntro";
import { SectionHeading } from "@/components/SectionHeading";

const projects = [
  {
    title: "SDVX OCR",
    description:
      "리듬게임 결과 화면을 OCR로 인식하고 정확도를 개선한 프로젝트입니다.",
    stack: ["Python", "OpenCV", "OCR"],
  },
  {
    title: "LMS 시스템",
    description: "학습 관리 기능과 사용자 권한 흐름을 구현한 웹 시스템입니다.",
    stack: ["JSP", "MySQL", "Backend"],
  },
  {
    title: "UDP File Transfer",
    description:
      "UDP 브로드캐스트 기반 파일 전송 프로그램의 안정성과 성능을 개선했습니다.",
    stack: ["C", "WinSock", "Network"],
  },
];

export const metadata = {
  title: "프로젝트",
  description: "필자 소개와 개발 프로젝트를 정리합니다.",
};

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Projects"
        title="프로젝트"
        description="진행했던 개발 프로젝트와 사용 기술을 간단히 정리했습니다."
      />
      <AuthorIntro />
      <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/55 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
        {projects.map((project) => (
          <article
            key={project.title}
            className="border-b border-slate-200/80 p-5 last:border-b-0 dark:border-white/[0.08]"
          >
            <h2 className="text-base font-semibold tracking-tight text-slate-950 dark:text-slate-100">
              {project.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {project.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-slate-200/70 px-2 py-1 text-xs text-slate-600 dark:bg-white/[0.06] dark:text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

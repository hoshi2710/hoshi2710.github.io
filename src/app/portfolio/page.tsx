import { AuthorIntro } from "@/components/AuthorIntro";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectList } from "@/components/portfolio/ProjectList";
import { getAllProjects } from "@/lib/projects";

export const metadata = {
  title: "프로젝트",
  description: "필자 소개와 개발 프로젝트를 정리합니다.",
};

export default function PortfolioPage() {
  const projects = getAllProjects();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Projects"
        title="프로젝트"
        description="진행했던 개발 프로젝트와 사용 기술을 간단히 정리했습니다."
      />
      <AuthorIntro />
      <ProjectList projects={projects} />
    </div>
  );
}

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const projectsDirectory = path.join(process.cwd(), "projects");

export type Project = {
  slug: string;
  title: string;
  description: string;
  stack: string[];
  featured: boolean;
  period?: string;
  repositoryUrl?: string;
  demoUrl?: string;
};

export type ProjectDetail = Project & {
  content: string;
};

function ensureProjectsDirectory() {
  if (!fs.existsSync(projectsDirectory)) {
    fs.mkdirSync(projectsDirectory, { recursive: true });
  }
}

function getProjectFiles() {
  ensureProjectsDirectory();

  return fs
    .readdirSync(projectsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .sort((a, b) => a.localeCompare(b));
}

function normalizeStack(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeProjectFrontMatter(
  fileSlug: string,
  data: Record<string, unknown>,
): Project {
  const slug = String(data.slug ?? fileSlug);

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    stack: normalizeStack(data.stack),
    featured: Boolean(data.featured ?? false),
    period: data.period ? String(data.period) : undefined,
    repositoryUrl: data.repositoryUrl ? String(data.repositoryUrl) : undefined,
    demoUrl: data.demoUrl ? String(data.demoUrl) : undefined,
  };
}

function readProjectFile(fileName: string): ProjectDetail {
  const fileSlug = fileName.replace(/\.mdx$/, "");
  const fullPath = path.join(projectsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    ...normalizeProjectFrontMatter(fileSlug, data),
    content,
  };
}

export function getAllProjects(): Project[] {
  return getProjectFiles().map((fileName) => {
    const { content: _content, ...project } = readProjectFile(fileName);
    return project;
  });
}

export function getFeaturedProjects() {
  return getAllProjects().filter((project) => project.featured);
}

export function getProjectSlugs() {
  return getAllProjects().map((project) => project.slug);
}

export function getProjectBySlug(slug: string) {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getProjectDetailBySlug(slug: string): ProjectDetail | null {
  const project = getProjectFiles()
    .map((fileName) => readProjectFile(fileName))
    .find((item) => item.slug === slug);

  return project ?? null;
}

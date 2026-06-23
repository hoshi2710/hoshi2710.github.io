import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

export type PostFrontMatter = {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  readingTime?: string;
};

export type Post = PostFrontMatter & {
  slug: string;
  content: string;
};

function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

export function getPostSlugs() {
  ensurePostsDirectory();
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

function normalizeFrontMatter(slug: string, data: Record<string, unknown>): PostFrontMatter {
  return {
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    date: String(data.date ?? new Date().toISOString()),
    category: String(data.category ?? '기록'),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    featured: Boolean(data.featured ?? false),
    readingTime: data.readingTime ? String(data.readingTime) : undefined,
  };
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    content,
    ...normalizeFrontMatter(realSlug, data),
  };
}

export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLatestPosts(count = 3) {
  return getAllPosts().slice(0, count);
}

export function getFeaturedPosts() {
  return getAllPosts().filter((post) => post.featured);
}

export function getCategories() {
  return Array.from(new Set(getAllPosts().map((post) => post.category))).sort((a, b) => a.localeCompare(b));
}

export function getTags() {
  return Array.from(new Set(getAllPosts().flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b));
}

export function getPostsByCategory(category: string) {
  return getAllPosts().filter((post) => post.category.toLowerCase() === category.toLowerCase());
}

export function getPostsByTag(tag: string) {
  return getAllPosts().filter((post) => post.tags.some((postTag) => postTag.toLowerCase() === tag.toLowerCase()));
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

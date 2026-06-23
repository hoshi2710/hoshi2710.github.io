import { FilterCloud } from "@/components/FilterCloud";
import { PostCard } from "@/components/PostCard";
import { getAllPosts, getCategories, getTags } from "@/lib/posts";

export const metadata = {
  title: "블로그",
  description: "전체 게시글과 카테고리/태그별 탐색 페이지입니다.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getCategories();
  const tags = getTags();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
      <section className="min-w-0">
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            전체 글
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            프로젝트를 진행하며 정리한 개발 기록입니다.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/55 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
      <FilterCloud categories={categories} tags={tags} />
    </div>
  );
}

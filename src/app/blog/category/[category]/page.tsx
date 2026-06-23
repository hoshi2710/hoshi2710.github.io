import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getCategories, getPostsByCategory } from "@/lib/posts";

export function generateStaticParams() {
  return getCategories().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return {
    title: `${decodeURIComponent(category)} 카테고리`,
    description: `${decodeURIComponent(category)} 카테고리 게시글 목록입니다.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const posts = getPostsByCategory(decodedCategory);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Category"
        title={decodedCategory}
        description="선택한 카테고리의 개발 기록입니다."
      />
      <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/55 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

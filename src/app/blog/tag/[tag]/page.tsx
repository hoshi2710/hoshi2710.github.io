import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getPostsByTag, getTags } from "@/lib/posts";

export function generateStaticParams() {
  return getTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return {
    title: `${decodeURIComponent(tag)} 태그`,
    description: `${decodeURIComponent(tag)} 태그 게시글 목록입니다.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Tag"
        title={decodedTag}
        description="선택한 태그가 붙은 개발 기록입니다."
      />
      <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/55 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.025]">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

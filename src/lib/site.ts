export const siteConfig = {
  name: "호시의 개발 노트",
  title: "호시 개발 노트 | 백엔드 · 인프라 기록",
  description: "백엔드, 인프라를 차분하게 정리하는 개발 블로그입니다.",
  author: "호시",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://hoshi2710.github.io/",
  social: {
    github: "https://github.com/hoshi2710",
    email: "hamh1121@icloud.com",
  },
};

export const navItems = [
  { href: "/", label: "홈" },
  { href: "/blog", label: "블로그" },
  { href: "/portfolio", label: "프로젝트" },
  { href: "/blog/tag/OCR", label: "태그" },
  { href: "/portfolio", label: "소개" },
];

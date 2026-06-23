# 이호현 개발 노트

Next.js + Tailwind CSS 기반 정적 개발 블로그입니다. `posts` 폴더의 `.mdx` 파일을 읽어 GitHub Pages에 배포 가능한 정적 HTML로 빌드합니다.

> 참고: Next.js는 Vite 기반 프레임워크가 아니므로, 이 프로젝트는 Vite 대신 Next.js 빌드/정적 export 파이프라인을 사용합니다.

## 주요 기능

- 홈: 최신 게시글, 소개, 태그, 최근 프로젝트
- 블로그: 전체 게시글 목록
- 카테고리/태그별 게시글 조회
- 게시글 상세: MDX 렌더링 + Giscus 댓글
- 프로젝트 페이지
- `/rss.xml` RSS 피드
- 반응형 레이아웃
- 다크모드 토글
- 미니멀한 개발 노트 스타일 UI

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 글 작성

`posts/my-post.mdx` 파일을 만들고 아래 frontmatter를 추가합니다.

```mdx
---
title: "게시글 제목"
description: "게시글 설명"
date: "2026-06-22"
category: "개발"
tags: ["Next.js", "MDX"]
featured: false
readingTime: "3분 읽기"
---

본문을 작성합니다.
```

파일명에서 `.mdx`를 제외한 값이 slug가 됩니다. 예: `posts/hello.mdx` → `/blog/hello/`

## Giscus 댓글 설정

게시글 상세 페이지 하단에 Giscus 댓글 영역이 포함되어 있습니다. 실제 댓글을 사용하려면 GitHub 저장소에서 아래 작업이 필요합니다.

1. 댓글을 저장할 GitHub 저장소에서 Discussions 활성화
2. [giscus.app](https://giscus.app)에서 저장소와 Discussion 카테고리 선택
3. 생성된 설정값을 환경변수로 등록

```bash
NEXT_PUBLIC_GISCUS_REPO=owner/repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDOxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxx
```

선택 설정:

```bash
NEXT_PUBLIC_GISCUS_MAPPING=pathname
NEXT_PUBLIC_GISCUS_STRICT=0
NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED=1
NEXT_PUBLIC_GISCUS_EMIT_METADATA=0
NEXT_PUBLIC_GISCUS_INPUT_POSITION=bottom
NEXT_PUBLIC_GISCUS_LANG=ko
```

설정값이 없으면 댓글 대신 설정 안내 박스가 표시됩니다.

## 정적 빌드

```bash
npm run build
```

`next.config.mjs`의 `output: 'export'` 설정으로 `out` 폴더가 생성됩니다.

## GitHub Pages 설정

저장소가 `https://github.com/{id}/{repo}`이고 Pages URL이 `https://{id}.github.io/{repo}` 형태라면 빌드 시 base path를 지정하세요.

```bash
NEXT_PUBLIC_BASE_PATH=/repo NEXT_PUBLIC_SITE_URL=https://{id}.github.io/{repo} npm run build
```

사용자/조직 페이지(`https://{id}.github.io`) 루트에 배포한다면 `NEXT_PUBLIC_BASE_PATH`는 비워둡니다.

## 수정할 곳

- 사이트 정보: `src/lib/site.ts`
- Giscus 설정: `src/lib/giscus.ts` 또는 환경변수
- 필자 소개: `src/components/AuthorIntro.tsx`
- 프로젝트 항목: `src/app/portfolio/page.tsx`
- 글 추가: `posts/*.mdx`

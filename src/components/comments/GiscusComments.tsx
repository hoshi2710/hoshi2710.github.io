'use client';

import { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { giscusConfig, isGiscusConfigured } from '@/lib/giscus';

function getGiscusTheme() {
  if (typeof document === 'undefined') {
    return 'preferred_color_scheme';
  }

  return document.documentElement.classList.contains('dark') ? 'dark_dimmed' : 'light';
}

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !isGiscusConfigured()) {
      return;
    }

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', giscusConfig.repo);
    script.setAttribute('data-repo-id', giscusConfig.repoId);
    script.setAttribute('data-category', giscusConfig.category);
    script.setAttribute('data-category-id', giscusConfig.categoryId);
    script.setAttribute('data-mapping', giscusConfig.mapping);
    script.setAttribute('data-strict', giscusConfig.strict);
    script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled);
    script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata);
    script.setAttribute('data-input-position', giscusConfig.inputPosition);
    script.setAttribute('data-theme', getGiscusTheme());
    script.setAttribute('data-lang', giscusConfig.lang);

    container.appendChild(script);

    const observer = new MutationObserver(() => {
      const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');

      iframe?.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: {
              theme: getGiscusTheme(),
            },
          },
        },
        'https://giscus.app',
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      container.innerHTML = '';
    };
  }, []);

  if (!isGiscusConfigured()) {
    return (
      <section className="mt-12 rounded-lg border border-dashed border-slate-300/80 bg-white/40 p-5 text-sm text-slate-600 backdrop-blur dark:border-white/[0.12] dark:bg-white/[0.025] dark:text-slate-400">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
          <div>
            <h2 className="font-medium text-slate-900 dark:text-slate-100">댓글 설정이 필요합니다</h2>
            <p className="mt-2 leading-6">
              Giscus를 사용하려면 GitHub Discussions를 활성화한 뒤 <code className="rounded bg-slate-200/70 px-1 py-0.5 dark:bg-white/[0.06]">NEXT_PUBLIC_GISCUS_REPO</code>, <code className="rounded bg-slate-200/70 px-1 py-0.5 dark:bg-white/[0.06]">NEXT_PUBLIC_GISCUS_REPO_ID</code>, <code className="rounded bg-slate-200/70 px-1 py-0.5 dark:bg-white/[0.06]">NEXT_PUBLIC_GISCUS_CATEGORY_ID</code>를 설정하세요.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 border-t border-slate-200/80 pt-8 dark:border-white/[0.08]">
      <h2 className="mb-5 flex items-center gap-2 text-base font-semibold tracking-tight text-slate-950 dark:text-slate-100">
        <MessageSquare className="h-4 w-4 text-violet-500" /> 댓글
      </h2>
      <div ref={containerRef} />
    </section>
  );
}

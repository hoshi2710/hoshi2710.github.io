export const giscusConfig = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || '',
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '',
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'General',
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '',
  mapping: process.env.NEXT_PUBLIC_GISCUS_MAPPING || 'pathname',
  strict: process.env.NEXT_PUBLIC_GISCUS_STRICT || '0',
  reactionsEnabled: process.env.NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED || '1',
  emitMetadata: process.env.NEXT_PUBLIC_GISCUS_EMIT_METADATA || '0',
  inputPosition: process.env.NEXT_PUBLIC_GISCUS_INPUT_POSITION || 'bottom',
  lang: process.env.NEXT_PUBLIC_GISCUS_LANG || 'ko',
};

export function isGiscusConfigured() {
  return Boolean(giscusConfig.repo && giscusConfig.repoId && giscusConfig.categoryId);
}

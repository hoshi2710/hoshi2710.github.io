export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

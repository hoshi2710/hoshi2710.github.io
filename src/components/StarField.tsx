const stars = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 43) % 100}%`,
  top: `${(index * 61) % 100}%`,
  delay: `${(index % 7) * 0.45}s`,
}));

export function StarField() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f7f7f8] dark:bg-[#0f1117]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute h-0.5 w-0.5 rounded-full bg-slate-400/30 dark:bg-white/[0.18]"
          style={{ left: star.left, top: star.top, animationDelay: star.delay }}
        />
      ))}
    </div>
  );
}

export default function SearchLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-7">
        <div className="h-8 w-64 animate-pulse rounded-md bg-border-light" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded-md bg-border-light" />
      </div>

      {/* Result card skeletons */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-5 rounded-[var(--radius-lg)] border border-border-light bg-bg-card p-5"
          >
            {/* Cover skeleton */}
            <div className="h-[120px] w-[80px] shrink-0 animate-pulse rounded-[var(--radius-sm)] bg-border-light" />

            {/* Info skeleton */}
            <div className="flex flex-1 flex-col justify-center gap-2">
              <div className="h-5 w-48 animate-pulse rounded-md bg-border-light" />
              <div className="h-4 w-32 animate-pulse rounded-md bg-border-light" />
              <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-border-light" />
              <div className="mt-1 flex gap-3">
                <div className="h-3 w-16 animate-pulse rounded-md bg-border-light" />
                <div className="h-3 w-12 animate-pulse rounded-md bg-border-light" />
                <div className="h-3 w-14 animate-pulse rounded-md bg-border-light" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

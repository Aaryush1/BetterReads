export default function BookDetailLoading() {
  return (
    <div className="flex flex-col gap-10 pb-12 md:flex-row md:gap-12">
      {/* Left: Cover skeleton */}
      <div className="shrink-0 md:w-[240px]">
        <div className="mx-auto h-[300px] w-[200px] animate-pulse rounded-[var(--radius-lg)] bg-border-light md:mx-0" />
        <div className="mt-5 flex flex-col gap-2">
          <div className="h-12 animate-pulse rounded-[var(--radius-md)] bg-border-light" />
          <div className="h-10 animate-pulse rounded-[var(--radius-md)] bg-border-light" />
        </div>
      </div>

      {/* Right: Info skeleton */}
      <div className="flex-1">
        <div className="h-10 w-72 animate-pulse rounded-md bg-border-light" />
        <div className="mt-3 h-5 w-40 animate-pulse rounded-md bg-border-light" />

        {/* Rating skeleton */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-4 w-20 animate-pulse rounded-md bg-border-light" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 animate-pulse rounded bg-border-light"
              />
            ))}
          </div>
        </div>

        {/* Metadata skeleton */}
        <div className="mt-6 flex gap-6 border-b border-border-light pb-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 w-12 animate-pulse rounded bg-border-light" />
              <div className="h-5 w-16 animate-pulse rounded bg-border-light" />
            </div>
          ))}
        </div>

        {/* Description skeleton */}
        <div className="mt-7">
          <div className="mb-3 h-6 w-36 animate-pulse rounded-md bg-border-light" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-border-light" />
            <div className="h-4 w-full animate-pulse rounded bg-border-light" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-border-light" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-border-light" />
          </div>
        </div>
      </div>
    </div>
  );
}

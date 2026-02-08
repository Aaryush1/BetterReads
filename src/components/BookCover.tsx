import Image from "next/image";

interface BookCoverProps {
  src?: string | null;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { width: 80, height: 120 },
  md: { width: 128, height: 192 },
  lg: { width: 200, height: 300 },
};

export default function BookCover({
  src,
  title,
  size = "md",
  className = "",
}: BookCoverProps) {
  const { width, height } = sizeMap[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[var(--radius-sm)] ${className}`}
      style={{
        width,
        height,
        boxShadow: "var(--shadow-book)",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={`Cover of ${title}`}
          width={width}
          height={height}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-deep/20 via-green-medium/15 to-amber/10 p-3">
          <span className="line-clamp-3 text-center font-display text-sm font-medium text-text-secondary">
            {title}
          </span>
        </div>
      )}
      {/* Subtle inner border for realistic book edge */}
      <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-sm)] ring-1 ring-inset ring-black/5 dark:ring-white/5" />
    </div>
  );
}

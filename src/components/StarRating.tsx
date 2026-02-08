"use client";

import { useId, useState } from "react";

interface StarRatingProps {
  /** Current rating value (0.5–5.0 in 0.5 steps, or null) */
  value: number | null;
  /** Callback when rating changes (interactive mode only) */
  onChange?: (value: number | null) => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** If true, renders non-interactive display-only stars */
  readOnly?: boolean;
  /** Show "X / 5" label next to stars (only in lg size) */
  showLabel?: boolean;
}

const sizes = {
  sm: { star: 14, gap: 1 },
  md: { star: 18, gap: 2 },
  lg: { star: 24, gap: 3 },
};

export default function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
  showLabel = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value ?? 0;
  const { star: starSize, gap } = sizes[size];
  const interactive = !readOnly && !!onChange;

  function handleClick(rating: number) {
    if (!interactive) return;
    // Click on current rating to remove it
    if (value === rating) {
      onChange(null);
    } else {
      onChange(rating);
    }
  }

  return (
    <div className="flex items-center" style={{ gap }}>
      <div
        className="flex"
        style={{ gap }}
        onMouseLeave={() => interactive && setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            index={star}
            fillAmount={getFillAmount(star, displayValue)}
            size={starSize}
            interactive={interactive}
            onHoverHalf={(half) =>
              interactive && setHoverValue(star - 1 + (half === "left" ? 0.5 : 1))
            }
            onClick={(half) =>
              handleClick(star - 1 + (half === "left" ? 0.5 : 1))
            }
          />
        ))}
      </div>
      {showLabel && size === "lg" && value != null && (
        <span className="ml-1.5 text-sm font-medium text-text-secondary">
          {value} / 5
        </span>
      )}
    </div>
  );
}

/** Returns 0, 0.5, or 1 for how filled this star should be */
function getFillAmount(starIndex: number, value: number): number {
  const diff = value - (starIndex - 1);
  if (diff >= 1) return 1;
  if (diff >= 0.5) return 0.5;
  return 0;
}

interface StarProps {
  index: number;
  fillAmount: number;
  size: number;
  interactive: boolean;
  onHoverHalf: (half: "left" | "right") => void;
  onClick: (half: "left" | "right") => void;
}

function Star({ index, fillAmount, size, interactive, onHoverHalf, onClick }: StarProps) {
  const id = useId();
  const clipId = `star-clip-${index}-${id}`;

  return (
    <span
      className={`relative inline-block ${interactive ? "cursor-pointer" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x="0"
              y="0"
              width={fillAmount === 1 ? 24 : fillAmount === 0.5 ? 12 : 0}
              height="24"
            />
          </clipPath>
        </defs>
        {/* Empty star (border color) */}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          fill="var(--border)"
        />
        {/* Filled portion (amber) */}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          fill="var(--amber)"
          clipPath={`url(#${clipId})`}
        />
      </svg>
      {/* Invisible click/hover targets for left and right halves */}
      {interactive && (
        <>
          <span
            className="absolute inset-y-0 left-0 w-1/2"
            onMouseEnter={() => onHoverHalf("left")}
            onClick={(e) => {
              e.stopPropagation();
              onClick("left");
            }}
          />
          <span
            className="absolute inset-y-0 right-0 w-1/2"
            onMouseEnter={() => onHoverHalf("right")}
            onClick={(e) => {
              e.stopPropagation();
              onClick("right");
            }}
          />
        </>
      )}
    </span>
  );
}

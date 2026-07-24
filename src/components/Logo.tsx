interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * UNIFY logo — a stylized "U" formed by two rounded uprights joined by a
 * checkmark / calendar bar, with a small dusty-rose accent dot representing
 * the "next activity" indicator. Flat, vector, theme-aware.
 */
export function Logo({ size = 32, showWordmark = true, className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="UNIFY"
      >
        {/* U mark, hollow with checkmark inside */}
        <path
          d="M8 6v18a12 12 0 0 0 24 0V6"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className="text-primary"
        />
        {/* internal check / calendar tick */}
        <path
          d="M14 20l4 4 8-8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="text-primary"
        />
        {/* accent dot */}
        <circle cx="32" cy="8" r="3" className="fill-accent" />
      </svg>
      {showWordmark && (
        <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
          UNIFY
        </span>
      )}
    </div>
  );
}

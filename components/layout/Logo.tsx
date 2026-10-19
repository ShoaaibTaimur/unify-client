"use client";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

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
        <path
          d="M8 6v18a12 12 0 0 0 24 0V6"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className="text-primary"
        />
        <path
          d="M14 20l4 4 8-8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="text-primary"
        />
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

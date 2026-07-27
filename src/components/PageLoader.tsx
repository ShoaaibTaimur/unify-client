"use client";

import { Logo } from "./Logo";

export function PageLoader({ text = "Loading UNIFY…" }: { text?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo size={44} showWordmark={false} />
        </div>
      </div>
      <p className="font-display text-sm font-medium text-muted-foreground animate-pulse">
        {text}
      </p>
    </div>
  );
}

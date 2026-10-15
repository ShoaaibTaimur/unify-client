import type { ReactNode } from "react";

export function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[4px] border border-border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-2xs group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-primary shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            {label}
          </span>
        </div>
        <div className="text-muted-foreground/70 group-hover:text-primary transition-colors [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <span className="font-mono text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
          {value}
        </span>
      </div>
    </div>
  );
}

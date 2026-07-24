import { useState } from "react";
import { Logo } from "./Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CREDITS = [
  {
    name: "Md Shoaaib Taimur",
    role: "Creator & Lead Developer",
    description:
      "Designed, architected, and developed the complete UNIFY platform from concept to implementation, including the system architecture, user experience, backend design, frontend development, and overall product vision.",
    portfolio: "https://taimur.dev",
    linkedin: "https://www.linkedin.com/in/shoaaib-taimur/",
  },
  {
    name: "Toufiq Hasan Kiron",
    role: "UI Refinement & Project Contributor",
    description:
      "Contributed to refining the user interface, improving usability, and enhancing the overall user experience through design feedback and implementation improvements.",
    portfolio: "https://kiron.dev",
    linkedin: "https://www.linkedin.com/in/toufiq-hasan-kiron/",
  },
];

function CreditsDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground transition-colors hover:text-foreground">Credits</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Built by</DialogTitle>
          <DialogDescription>The people behind UNIFY.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          {CREDITS.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-base font-semibold text-foreground">{c.name}</div>
              <div className="mt-0.5 text-xs uppercase tracking-wide text-accent">{c.role}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={c.portfolio} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">Portfolio ↗</a>
                <span className="text-border">•</span>
                <a href={c.linkedin} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">LinkedIn ↗</a>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            One place for every academic activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">About</a>
          <CreditsDialog />
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UNIFY — All rights reserved.
      </div>
    </footer>
  );
}

export { Button };

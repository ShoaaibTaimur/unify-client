"use client";

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

function AboutDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground transition-colors duration-200 hover:text-foreground hover:scale-105 active:scale-95">About</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="mb-2 flex justify-center"><Logo size={40} /></div>
          <DialogTitle className="text-center font-display text-2xl">About UNIFY</DialogTitle>
          <DialogDescription className="text-center">
            One place for every academic activity in your university.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">UNIFY</strong> is a unified academic activity portal built to help university students, Class Representatives (CRs), teachers, and administrators organize class schedules and academic deadlines.
          </p>
          <p>
            It consolidates Class Tests (CTs), Lab Tests, Viva, Assignments, Presentations, and Term Exams into a single real-time dashboard — organized by <span className="font-medium text-foreground">Department</span>, <span className="font-medium text-foreground">Batch</span>, and <span className="font-medium text-foreground">Section</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreditsDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground transition-colors duration-200 hover:text-foreground hover:scale-105 active:scale-95">Credits</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Built by</DialogTitle>
          <DialogDescription>The people behind UNIFY.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          {CREDITS.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border bg-card p-5 transition-transform duration-200 hover:scale-[1.02] shadow-xs">
              <div className="text-base font-semibold text-foreground">{c.name}</div>
              <div className="mt-0.5 text-xs uppercase tracking-wide text-accent font-medium">{c.role}</div>
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
    <footer className="mt-16 border-t border-border/60 bg-background/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            One place for every academic activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <AboutDialog />
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

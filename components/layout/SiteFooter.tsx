"use client";

import { useState } from "react";
import { Logo } from "./Logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

function AboutDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-primary transition-colors">
          About
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto rounded-[4px] border border-border bg-card p-6 shadow-2xs">
        <DialogHeader className="space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size={36} />
          </div>
          <DialogTitle className="text-center font-display text-2xl font-bold tracking-tight text-foreground">
            About UNIFY
          </DialogTitle>
          <DialogDescription className="text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
            One place for every academic activity in your university
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground font-semibold">UNIFY</strong> is a unified academic activity portal built to help university students, Class Representatives (CRs), teachers, and administrators organize class schedules and academic deadlines.
          </p>
          <p>
            It consolidates Class Tests (CTs), Lab Tests, Viva, Assignments, Presentations, and Term Exams into a single real-time dashboard — organized by <span className="font-semibold text-primary">Department</span>, <span className="font-semibold text-primary">Batch</span>, and <span className="font-semibold text-primary">Section</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MadeByDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-primary transition-colors">
          Made by
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-[4px] border border-border bg-card p-6 shadow-2xs">
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-display text-2xl font-bold tracking-tight text-center text-foreground">
            Made by
          </DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-wider text-center text-muted-foreground">
            UNIFY is crafted and maintained by DevMotive
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <a
            href="https://devmotive.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 rounded-[4px] border border-border bg-secondary/30 p-6 shadow-2xs transition-colors hover:border-primary/50 hover:bg-secondary/60 w-full"
          >
            <img
              src="/devmotive_logo.png"
              alt="DevMotive logo"
              className="h-16 w-16 rounded-[4px] object-contain"
            />
            <div className="text-center">
              <div className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                DevMotive
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                devmotive.dev ↗
              </p>
            </div>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Logo />
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            One place for every academic activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider">
          <a
            href="https://examsync.kiron.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline transition-colors"
          >
            Exam Seat Plan (ExamSync) ↗
          </a>
          <AboutDialog />
          <MadeByDialog />
        </div>
      </div>
      <div className="border-t border-border py-4 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        © {new Date().getFullYear()} UNIFY — All rights reserved.
      </div>
    </footer>
  );
}

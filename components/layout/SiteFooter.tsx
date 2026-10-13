"use client";

import { useState } from "react";
import { Logo } from "./Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";



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

function MadeByDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground transition-colors duration-200 hover:text-foreground hover:scale-105 active:scale-95">Made by</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">Made by</DialogTitle>
          <DialogDescription className="text-center">
            UNIFY is crafted and maintained by DevMotive.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5 py-4">
          <a
            href="https://devmotive.site"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/devmotive_logo.png"
              alt="DevMotive logo"
              className="h-16 w-16 rounded-xl object-contain"
            />
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">DevMotive</div>
              <div className="mt-0.5 text-sm text-muted-foreground">devmotive.site ↗</div>
            </div>
          </a>
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
          <a
            href="https://examsync.kiron.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline transition-colors"
          >
            Exam Seat Plan (ExamSync) ↗
          </a>
          <AboutDialog />
          <MadeByDialog />
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UNIFY — All rights reserved.
      </div>
    </footer>
  );
}

export { Button };

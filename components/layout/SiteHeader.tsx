"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { hasSelectedClass, useClassSelection } from "@/lib/session";
import { useAuth } from "@/lib/auth";
import { hasActiveExams, getActivityQueryKey } from "@/lib/utils";
import {
  Menu,
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  LogIn,
  UserCircle2,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/activities", label: "Activities", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { cls } = useClassSelection();
  const activities = useQuery({
    queryKey: getActivityQueryKey(cls),
    enabled: hasSelectedClass(cls),
    queryFn: () => (hasSelectedClass(cls) ? api.listActivities(cls!) : Promise.resolve([])),
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const showSeatPlan = mounted && hasActiveExams(activities.data);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const dashLink = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "teacher"
        ? "/teacher"
        : user.role === "cr"
          ? "/cr"
          : "/"
    : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-12 items-stretch justify-between">
        {/* Left: Logo & Navigation */}
        <div className="flex min-w-0 items-stretch">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex w-12 items-center justify-center border-r border-border text-foreground/70 hover:bg-foreground hover:text-background md:hidden transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 rounded-none border-r border-border bg-background">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-2 font-mono text-xs uppercase tracking-wider">
                {NAV.map((n) => {
                  const active = pathname === n.to;
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.to}
                      href={n.to}
                      prefetch={false}
                      className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-colors border-b border-border/40 ${active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
                        }`}
                    >
                      <Icon className="h-4 w-4" /> {n.label}
                    </Link>
                  );
                })}
                {showSeatPlan && (
                  <a
                    href="https://examsync.kiron.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors border-b border-border/40"
                  >
                    <ExternalLink className="h-4 w-4" /> Seat Plan ↗
                  </a>
                )}
                <div className="my-2 border-t border-border" />
                {user ? (
                  <Link
                    href={dashLink}
                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    {user.role} Panel
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <LogIn className="h-4 w-4" /> Sign In
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex items-center border-r border-border px-4 sm:px-6 hover:opacity-80 transition-opacity"
          >
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-stretch md:flex">
            {NAV.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  href={n.to}
                  prefetch={false}
                  className={`group flex items-center gap-2 border-r border-border/60 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap transition-colors ${active
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "text-muted-foreground hover:bg-primary/15 hover:text-primary"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
            {showSeatPlan && (
              <a
                href="https://examsync.kiron.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 border-r border-border/60 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <span>Seat Plan</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </nav>
        </div>

        {/* Right: Class Indicator, Theme Toggle & User CTA */}
        <div className="flex shrink-0 items-stretch">
          <div className="flex items-stretch border-l border-border">
            <ThemeToggle className="h-full w-12 rounded-none hover:bg-primary/15 hover:text-primary transition-colors" />
          </div>
          {user ? (
            <Link
              href={dashLink}
              className="inline-flex items-center justify-center border-l border-border bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground px-4 sm:px-5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors"
            >
              {user.role} Panel
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center border-l border-border bg-primary text-primary-foreground hover:bg-primary-deep px-4 sm:px-5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

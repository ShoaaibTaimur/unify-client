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
import { getStoredUser, hasSelectedClass, useClassSelection } from "@/lib/session";
import type { User } from "@/lib/types";
import { hasActiveExams } from "@/lib/utils";
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
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  const { cls } = useClassSelection();
  const activities = useQuery({
    queryKey: ["activities", cls?.departmentId, cls?.batchId, cls?.sectionId],
    enabled: !!cls && hasSelectedClass(cls),
    queryFn: () =>
      api.listActivities({
        departmentId: cls!.departmentId,
        batchId: cls!.batchId,
        sectionId: cls!.sectionId,
      }),
  });

  const showSeatPlan = hasActiveExams(activities.data);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    window.addEventListener("unify:auth-changed", sync);
    return () => window.removeEventListener("unify:auth-changed", sync);
  }, []);

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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full md:hidden hover:scale-105 active:scale-95 transition-transform"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3">
                {NAV.map((n) => {
                  const active = pathname === n.to;
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.to}
                      href={n.to}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-foreground/80 hover:bg-muted hover:translate-x-1"
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
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-all duration-200 mt-1"
                  >
                    <ExternalLink className="h-4 w-4" /> Exam Seat Plan ↗
                  </a>
                )}
                <div className="my-3 border-t border-border" />
                {user ? (
                  <Link
                    href={dashLink}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:translate-x-1 transition-all duration-200"
                  >
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    {user.role[0].toUpperCase() + user.role.slice(1)} panel
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:translate-x-1 transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4 text-primary" /> Sign in
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  href={n.to}
                  className={`group relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}
                  />
                  <span>{n.label}</span>
                </Link>
              );
            })}
            {showSeatPlan && (
              <a
                href="https://examsync.kiron.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold text-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-primary/30 ml-1"
              >
                <span>Seat Plan</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link href={dashLink} className="hidden md:inline-flex">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 shadow-xs"
              >
                {user.role[0].toUpperCase() + user.role.slice(1)} panel
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="hidden md:inline-flex">
              <Button
                size="sm"
                className="rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 shadow-xs"
              >
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

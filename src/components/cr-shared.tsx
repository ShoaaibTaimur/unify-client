"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearStoredSession } from "@/lib/session";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  LogOut,
  CalendarDays,
  Menu,
  LayoutDashboard,
  Search,
  KeyRound,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";

const PANEL_NAV = [
  {
    to: "/",
    label: "Public dashboard",
    icon: LayoutDashboard,
    description: "Student-facing home",
  },
  {
    to: "/activities",
    label: "Browse activities",
    icon: Search,
    description: "Search & filter",
  },
  {
    to: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
    description: "Monthly view",
  },
  {
    to: "/change-password",
    label: "Change password",
    icon: KeyRound,
    description: "Update credentials",
  },
] as const;

export function QuickActions({ onAdd, onImportCsv }: { onAdd?: () => void; onImportCsv?: () => void }) {
  const items = [
    ...(onAdd
      ? [
          {
            label: "Add activity",
            description: "Create a single activity",
            icon: Plus,
            onClick: onAdd,
          },
        ]
      : []),
    ...(onImportCsv
      ? [
          {
            label: "Import CSV Routine",
            description: "Bulk upload exam routines",
            icon: FileSpreadsheet,
            onClick: onImportCsv,
          },
        ]
      : []),
    ...PANEL_NAV.map((n) => ({
      label: n.label,
      description: n.description,
      icon: n.icon,
      to: n.to,
    })),
  ];
  return (
    <div className="mt-8">
      <h2 className="font-display text-2xl">Quick actions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything you need, in one place.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => {
          const Icon = n.icon;
          const inner = (
            <>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="font-medium">{n.label}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {n.description}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </>
          );
          const cls =
            "group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md";
          return "to" in n && n.to ? (
            <Link key={n.label} href={n.to} className={cls}>
              {inner}
            </Link>
          ) : (
            <button
              key={n.label}
              type="button"
              onClick={(n as { onClick?: () => void }).onClick}
              className={cls}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TopBar({ user, title }: { user: User; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3">
                {PANEL_NAV.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.to}
                      href={n.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                    >
                      <Icon className="h-4 w-4" /> {n.label}
                    </Link>
                  );
                })}
                <div className="my-3 border-t border-border" />
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="text-xs font-medium">{user.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Logo />
          </Link>
        </div>
        <div className="hidden font-display text-lg md:block">{title}</div>
        <div className="flex items-center gap-2">
          <div className="hidden text-right text-xs sm:block">
            <div className="font-medium">{user.name}</div>
            <div className="truncate text-muted-foreground">{user.email}</div>
          </div>
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              clearStoredSession();
              router.push("/login");
            }}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="font-display text-3xl leading-tight">{value}</div>
        </div>
      </div>
    </div>
  );
}

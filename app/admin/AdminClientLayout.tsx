"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import type { User } from "@/types";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Network,
  LogOut,
  Menu,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export type AdminNavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  description?: string;
};

const ADMIN_NAV: AdminNavItem[] = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    description: "Overview & quick stats",
  },
  {
    to: "/admin/organization",
    label: "Organization",
    icon: Network,
    description: "Departments, batches & sections",
  },
  {
    to: "/admin/activities",
    label: "Activities",
    icon: CalendarDays,
    description: "All activities across UNIFY",
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: Users,
    description: "CRs, teachers & admins",
  },
];



export function AdminClientLayout({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, isPending: authPending, logout } = useAuth();
  const user = authUser ?? initialUser ?? null;
  const isPending = authPending && !user;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.mustChangePassword) {
      router.replace("/change-password");
      return;
    }
    if (user.role !== "admin") {
      router.replace(user.role === "teacher" ? "/teacher" : user.role === "cr" ? "/cr" : "/");
      return;
    }
  }, [user, isPending, router, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isPending || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const NavList = (
    <nav className="flex-1 space-y-1">
      {ADMIN_NAV.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        const Icon = n.icon;
        return (
          <Link
            key={n.to}
            href={n.to}
            className={`flex items-center gap-3 rounded-[4px] px-3 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold transition-colors ${
              active
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 h-12 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex h-full items-stretch justify-between">
          {/* Left: Brand + Desktop Nav */}
          <div className="flex items-stretch min-w-0">
            <div className="md:hidden flex items-stretch border-r border-border">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-12 rounded-none hover:bg-primary/10 hover:text-primary"
                    aria-label="Open admin menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-card p-0 border-r border-border">
                  <SheetHeader className="border-b border-border p-4">
                    <SheetTitle className="text-left">
                      <Logo />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex h-[calc(100%-4rem)] flex-col p-3">
                    {NavList}
                    <div className="mt-4 rounded-[4px] border border-border bg-secondary/30 p-3 font-mono">
                      <div className="text-xs font-bold text-foreground">{user.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="flex items-center px-4 sm:px-5 border-r border-border">
              <Logo />
            </Link>

            <nav className="hidden md:flex items-stretch">
              {ADMIN_NAV.map((n) => {
                const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    href={n.to}
                    className={`flex items-center gap-2 px-4 border-r border-border font-mono text-[11px] uppercase tracking-[0.12em] font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                        : "text-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{n.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: User status, ThemeToggle, Logout */}
          <div className="flex items-stretch shrink-0">
            <div className="hidden lg:flex items-center gap-2 px-3 border-l border-border font-mono text-[11px]">
              <span className="h-1.5 w-1.5 bg-primary shrink-0" />
              <span className="text-foreground font-bold">{user.name}</span>
              <span className="text-muted-foreground truncate max-w-[140px]">({user.email})</span>
            </div>

            <div className="flex items-stretch border-l border-border">
              <ThemeToggle className="h-full w-12 rounded-none hover:bg-primary/15 hover:text-primary transition-colors" />
            </div>

            <button
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="inline-flex items-center justify-center gap-1.5 border-l border-border px-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}

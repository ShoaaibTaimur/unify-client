"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/state";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Menu,
  KeyRound,
  Search,
  Network,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { DashboardRole } from "@/types/auth";
import { getDashboardPath } from "@/lib/auth-client";



const NAV_ITEMS = [
  {
    to: "/",
    label: "Public dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/activities",
    label: "Browse activities",
    icon: Search,
  },
  {
    to: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
  },
  {
    to: "/change-password",
    label: "Change password",
    icon: KeyRound,
  },
];

const ADMIN_NAV_ITEMS = [
  { to: "/admin/organization", label: "Organization", icon: Network },
  { to: "/admin/activities", label: "Activities", icon: CalendarDays },
  { to: "/admin/users", label: "Users", icon: Users },
];

export function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: DashboardRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isPending: authPending, isOffline, error, refetch, logout } = useAuth();
  const isPending = authPending && !user;
  const [open, setOpen] = useState(false);
  const roleLabel = role === "cr" ? "CR" : role === "admin" ? "Admin" : "Teacher";
  const dashboardPath = getDashboardPath(role);

  const orgLabel =
    role === "teacher" ? user?.departmentName : user?.organizationLabel;
  const navItems = role === "admin" ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  useEffect(() => {
    if (isPending || isOffline) return;

    if (!user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.mustChangePassword) {
      router.replace("/change-password");
      return;
    }
    if (user.role !== role) {
      router.replace(getDashboardPath(user.role));
      return;
    }
  }, [user, isPending, isOffline, role, router, pathname]);

  const isAllowed = user && user.role === role;

  if (isOffline && !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-semibold">Unable to verify your session.</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (isPending || !user || !isAllowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign out");
    }
  };

  const NavList = (
    <nav className="flex flex-col p-2 font-mono text-xs uppercase tracking-wider">
      <Link
        href={dashboardPath}
        onClick={() => setOpen(false)}
        prefetch={false}
        className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-colors border-b border-border/40 ${
          pathname === dashboardPath
            ? "bg-primary text-primary-foreground font-bold shadow-2xs"
            : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
        }`}
      >
        <LayoutDashboard className="h-4 w-4" /> {roleLabel} Panel
      </Link>
      {navItems.map((n) => {
        const Icon = n.icon;
        const active = n.to === "/" ? false : pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            href={n.to}
            onClick={() => setOpen(false)}
            prefetch={false}
            className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-colors border-b border-border/40 ${
              active
                ? "bg-primary text-primary-foreground font-bold shadow-2xs"
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
          {/* Left: Hamburger + Logo + Desktop Nav */}
          <div className="flex items-stretch min-w-0">
            <div className="md:hidden flex items-stretch border-r border-border">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex w-12 items-center justify-center text-foreground/70 hover:bg-foreground hover:text-background transition-colors"
                    aria-label={`Open ${roleLabel} menu`}
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
                  <div className="flex h-[calc(100%-4rem)] flex-col justify-between p-2">
                    {NavList}
                    <div className="rounded-[4px] border border-border bg-secondary/30 p-3 font-mono">
                      <div className="text-xs font-bold text-foreground">{user.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
                      {orgLabel && (
                        <div className="mt-1 text-[11px] font-semibold text-primary truncate">
                          {orgLabel}
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="flex items-center px-4 sm:px-5 border-r border-border">
              <Logo />
            </Link>

            <nav className="hidden md:flex items-stretch">
              <Link
                href={dashboardPath}
                prefetch={false}
                className={`flex items-center gap-2 px-4 border-r border-border font-mono text-[11px] uppercase tracking-[0.12em] font-semibold transition-colors ${
                  pathname === dashboardPath
                    ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{roleLabel} Panel</span>
              </Link>
              {navItems.map((n) => {
                const Icon = n.icon;
                const active = n.to === "/" ? false : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    href={n.to}
                    prefetch={false}
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

          {/* Right: User identity, ThemeToggle, Sign out */}
          <div className="flex items-stretch shrink-0">
            <div className="hidden lg:flex items-center gap-2 px-3 border-l border-border font-mono text-[11px]">
              <span className="h-1.5 w-1.5 bg-primary shrink-0" />
              <span className="text-foreground font-bold">{user.name}</span>
              {orgLabel ? (
                <span className="text-primary truncate max-w-[140px] font-semibold">({orgLabel})</span>
              ) : (
                <span className="text-muted-foreground truncate max-w-[140px]">({user.email})</span>
              )}
            </div>

            <div className="flex items-stretch border-l border-border">
              <ThemeToggle className="h-full w-12 rounded-none hover:bg-primary/15 hover:text-primary transition-colors" />
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-1.5 border-l border-border bg-primary text-primary-foreground hover:bg-primary-deep px-4 sm:px-5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className={role === "admin" ? "mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8" : "flex-1"}>{children}</main>
    </div>
  );
}

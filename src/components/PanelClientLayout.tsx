"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, clearStoredSession } from "@/lib/session";
import type { User } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
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
} from "lucide-react";

type AllowedRole = "cr" | "teacher";

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

export function PanelClientLayout({
  children,
  role,
  roleLabel,
  panelHref,
}: {
  children: React.ReactNode;
  role: AllowedRole;
  roleLabel: string;
  panelHref: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.push("/login"); return; }
    if (u.mustChangePassword) { router.push("/change-password"); return; }
    if (u.role !== role) {
      if (u.role === "admin") router.push("/admin");
      else if (u.role === "cr") router.push("/cr");
      else router.push("/teacher");
      return;
    }
    setUser(u);
  }, [role, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user) return null;

  const handleSignOut = () => {
    clearStoredSession();
    router.push("/login");
  };

  const NavList = (
    <nav className="flex-1 space-y-1">
      <Link
        href={panelHref}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          pathname === panelHref
            ? "bg-primary text-primary-foreground"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        }`}
      >
        <LayoutDashboard className="h-4 w-4" /> {roleLabel} Panel
      </Link>
      {NAV_ITEMS.map((n) => {
        const Icon = n.icon;
        const active = n.to === "/" ? false : pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            href={n.to}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
      <div className="my-2 border-t border-border" />
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur sm:px-6">
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
              <div className="flex h-[calc(100%-4rem)] flex-col p-3">
                {NavList}
                <div className="mt-4 rounded-xl border border-border bg-card p-3">
                  <div className="text-xs font-medium">{user.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Logo />
          </Link>
        </div>

        <div className="hidden font-display text-base font-semibold md:block text-foreground/80">
          {roleLabel} Panel
        </div>

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
            onClick={handleSignOut}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, clearStoredSession } from "@/lib/session";
import type { User } from "@/lib/types";
import { Logo } from "@/components/Logo";
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
import { ThemeToggle } from "@/components/ThemeToggle";

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

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.push("/login"); return; }
    if (u.mustChangePassword) { router.push("/change-password"); return; }
    if (u.role !== "admin") {
      router.push(u.role === "teacher" ? "/teacher" : "/cr");
      return;
    }
    setUser(u);
  }, [router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user) return null;

  const NavList = (
    <nav className="flex-1 space-y-1">
      {ADMIN_NAV.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        const Icon = n.icon;
        return (
          <Link
            key={n.to}
            href={n.to}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
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
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}

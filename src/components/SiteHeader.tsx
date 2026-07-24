import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getStoredUser } from "@/lib/session";
import type { User } from "@/lib/types";
import { Menu, LayoutDashboard, ListChecks, CalendarDays, LogIn, UserCircle2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/activities", label: "Activities", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    window.addEventListener("unify:auth-changed", sync);
    return () => window.removeEventListener("unify:auth-changed", sync);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const dashLink = user
    ? user.role === "admin" ? "/admin"
      : user.role === "teacher" ? "/teacher"
      : user.role === "cr" ? "/cr" : "/"
    : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle className="text-left"><Logo /></SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3">
                {NAV.map((n) => {
                  const active = pathname === n.to;
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.to} to={n.to}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {n.label}
                    </Link>
                  );
                })}
                <div className="my-3 border-t border-border" />
                {user ? (
                  <Link to={dashLink} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted">
                    <UserCircle2 className="h-4 w-4" />
                    {user.role[0].toUpperCase() + user.role.slice(1)} panel
                  </Link>
                ) : (
                  <Link to="/login" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted">
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex min-w-0 items-center gap-2"><Logo /></Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to={dashLink}>
              <Button variant="outline" size="sm" className="rounded-full">
                {user.role[0].toUpperCase() + user.role.slice(1)} panel
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

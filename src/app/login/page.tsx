"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { setStoredSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      setStoredSession(token, user);
      toast.success(`Welcome, ${user.name}`);
      if (user.mustChangePassword) {
        router.push("/change-password");
      } else {
        router.push(
          user.role === "admin"
            ? "/admin"
            : user.role === "teacher"
              ? "/teacher"
              : "/cr"
        );
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary-deep)] p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <h2 className="font-display text-5xl leading-tight">
            One place for every academic activity.
          </h2>
          <p className="mt-4 max-w-md text-sm opacity-80">
            UNIFY brings Class Tests, Labs, Viva, Assignments, and Exams into a
            single premium portal — organized by Department, Batch, and Section.
          </p>
        </div>
        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} UNIFY
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>
            <ThemeToggle />
          </div>
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            For CRs, Teachers, and Admins. Students don&apos;t need an account.
          </p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="you@unify.edu"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            Only accounts created by an administrator can sign in. CRs and
            teachers are added from the Admin panel.
          </div>
        </div>
      </div>
    </div>
  );
}

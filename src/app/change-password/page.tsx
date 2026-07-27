"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getStoredUser, setStoredSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 6) return toast.error("Password must be at least 6 characters");
    if (next !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await api.changePassword(current, next);
      const user = getStoredUser();
      if (user)
        setStoredSession(localStorage.getItem("unify_token")!, {
          ...user,
          mustChangePassword: false,
        });
      toast.success("Password updated");
      router.push(
        user?.role === "admin"
          ? "/admin"
          : user?.role === "teacher"
            ? "/teacher"
            : "/cr"
      );
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card">
        <Logo />
        <h1 className="mt-6 font-display text-2xl">Change your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You must set a new password before continuing.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current password
            </label>
            <Input
              type="password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              New password
            </label>
            <Input
              type="password"
              required
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Confirm new password
            </label>
            <Input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-xl"
            disabled={loading}
          >
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

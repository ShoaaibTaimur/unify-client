"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { getSafeRedirectUrl, isRoleAuthorized } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentSessionUser, isPending: sessionPending, login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!sessionPending && currentSessionUser) {
      const fromParam = getSafeRedirectUrl(searchParams.get("from") || searchParams.get("redirect"));
      if (fromParam && isRoleAuthorized(currentSessionUser.role, fromParam)) {
        router.replace(fromParam);
      } else if (currentSessionUser.role === "admin") {
        router.replace("/admin");
      } else if (currentSessionUser.role === "cr") {
        router.replace("/cr");
      } else if (currentSessionUser.role === "teacher") {
        router.replace("/teacher");
      } else {
        router.replace("/");
      }
    }
  }, [currentSessionUser, sessionPending, searchParams, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);

      const fromParam = getSafeRedirectUrl(searchParams.get("from") || searchParams.get("redirect"));
      if (fromParam && isRoleAuthorized(user.role, fromParam)) {
        router.replace(fromParam);
      } else if (user.role === "admin") {
        router.replace("/admin");
      } else if (user.role === "cr") {
        router.replace("/cr");
      } else if (user.role === "teacher") {
        router.replace("/teacher");
      } else {
        router.replace("/");
      }
    } catch (err) {
      toast.error((err as Error).message || "Failed to sign in");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Button
        variant="outline"
        size="sm"
        asChild
        className="mb-4 self-start rounded-[4px] border border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 group transition-colors"
      >
        <Link href="/">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </Button>

      <div className="rounded-[4px] border border-border bg-card p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-10 w-10 place-items-center rounded-[4px] bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
            Portal Sign In
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Access CR, Teacher, or Admin management console
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                {...register("email")}
                placeholder="name@university.edu"
                className="h-10 rounded-[4px] font-mono text-xs pl-10 border border-border bg-background"
              />
            </div>
            {errors.email && (
              <p className="font-mono text-[11px] text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                {...register("password")}
                placeholder="••••••••"
                className="h-10 rounded-[4px] font-mono text-xs pl-10 border border-border bg-background"
              />
            </div>
            {errors.password && (
              <p className="font-mono text-[11px] text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full h-10 rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold shadow-2xs transition-colors"
          >
            {isSubmitting ? "Signing in..." : "Sign in to Portal"}
          </Button>
        </form>
      </div>
    </div>
  );
}

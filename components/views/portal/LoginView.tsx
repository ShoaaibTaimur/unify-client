"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getSafeRedirectUrl(target: string | null): string | null {
  if (!target) return null;
  if (target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")) {
    return target;
  }
  return null;
}

function isRoleAuthorized(role: string, target: string): boolean {
  if (target.startsWith("/admin")) return role === "admin";
  if (target.startsWith("/teacher")) return role === "teacher";
  if (target.startsWith("/cr")) return role === "cr";
  return true;
}

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
        router.push(fromParam);
      } else if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "cr") {
        router.push("/cr");
      } else if (user.role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/");
      }
    } catch (err) {
      toast.error((err as Error).message || "Failed to sign in");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="mb-4 self-start rounded-xl text-xs text-muted-foreground hover:text-foreground group"
      >
        <Link href="/">
          <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </Button>

      <div className="rounded-3xl border border-border bg-card p-8 shadow-card backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
            Portal Sign In
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Access CR, Teacher, or Admin management console
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                {...register("email")}
                placeholder="name@university.edu"
                className="h-11 rounded-xl pl-10 text-sm"
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                {...register("password")}
                placeholder="••••••••"
                className="h-11 rounded-xl pl-10 text-sm"
              />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full h-11 rounded-xl text-sm font-semibold shadow-xs"
          >
            {isSubmitting ? "Signing in..." : "Sign in to Portal"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-xl text-xs text-muted-foreground hover:text-foreground group"
          >
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeyRound, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordView() {
  const router = useRouter();
  const { user, isPending } = useAuth();

  const dashLink =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "teacher"
      ? "/teacher"
      : user?.role === "cr"
      ? "/cr"
      : "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-muted-foreground">
        Loading security session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-muted-foreground">
        Please sign in to change your password.
      </div>
    );
  }

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await api.changePassword(data.oldPassword, data.newPassword);
      toast.success("Password changed successfully. Please sign in with your new credentials.");
      router.push("/login");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update password");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-4">
        <Button
          asChild
          variant="outline"
          className="rounded-[4px] border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold h-8 px-3 transition-colors"
        >
          <Link href={dashLink}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </Button>
      </div>
      <div className="rounded-[4px] border border-border bg-card p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-10 w-10 place-items-center rounded-[4px] bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
            Change Password
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Update security credentials for {user.name} ({user.email})
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground">Current Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                {...register("oldPassword")}
                placeholder="Current password"
                className="h-10 rounded-[4px] font-mono text-xs pl-10 border border-border bg-background"
              />
            </div>
            {errors.oldPassword && (
              <p className="font-mono text-[11px] text-destructive mt-1">
                {errors.oldPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground">New Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                {...register("newPassword")}
                placeholder="Minimum 6 characters"
                className="h-10 rounded-[4px] font-mono text-xs pl-10 border border-border bg-background"
              />
            </div>
            {errors.newPassword && (
              <p className="font-mono text-[11px] text-destructive mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground">Confirm New Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                {...register("confirmPassword")}
                placeholder="Re-enter new password"
                className="h-10 rounded-[4px] font-mono text-xs pl-10 border border-border bg-background"
              />
            </div>
            {errors.confirmPassword && (
              <p className="font-mono text-[11px] text-destructive mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full h-10 rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold shadow-2xs transition-colors"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

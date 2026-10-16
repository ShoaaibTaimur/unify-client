import type { Role } from "@/types";

export function getSafeRedirectUrl(target: string | null): string | null {
  if (!target) return null;
  if (target === "/login" || target.startsWith("/login?") || target === "/change-password") {
    return null;
  }
  return target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")
    ? target
    : null;
}

export function isRoleAuthorized(role: Role, target: string): boolean {
  if (target.startsWith("/admin")) return role === "admin";
  if (target.startsWith("/teacher")) return role === "teacher";
  if (target.startsWith("/cr")) return role === "cr";
  return true;
}

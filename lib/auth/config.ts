if (typeof window !== "undefined") {
  throw new Error("auth/config can only be loaded in server environments.");
}

export function getBackendUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return url.replace(/\/$/, "");
}

/**
 * Validate that state-changing requests come from the same origin to mitigate CSRF.
 */
export function validateOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

import { cookies } from "next/headers";

if (typeof window !== "undefined") {
  throw new Error("auth-cookies can only be executed in a server environment.");
}

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}

export interface TokenLifetimes {
  maxAge: number;
  refreshMaxAge: number;
}

export function getCookieOptions(maxAge: number): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ACCESS_COOKIE_NAME);
    if (!cookie?.value) return null;
    return decodeURIComponent(cookie.value);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(REFRESH_COOKIE_NAME);
    if (!cookie?.value) return null;
    return decodeURIComponent(cookie.value);
  } catch {
    return null;
  }
}

/**
 * Set HTTP-only auth cookies using token lifetimes provided by backend.
 * Zero hardcoded lifetimes on frontend.
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  lifetimes: TokenLifetimes
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    ACCESS_COOKIE_NAME,
    encodeURIComponent(accessToken),
    getCookieOptions(lifetimes.maxAge)
  );
  cookieStore.set(
    REFRESH_COOKIE_NAME,
    encodeURIComponent(refreshToken),
    getCookieOptions(lifetimes.refreshMaxAge)
  );
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  const expiredOptions = { ...getCookieOptions(0), maxAge: 0 };
  cookieStore.set(ACCESS_COOKIE_NAME, "", expiredOptions);
  cookieStore.set(REFRESH_COOKIE_NAME, "", expiredOptions);

  // Clear legacy tokens to ensure full cleanup
  cookieStore.set("unify_token", "", expiredOptions);
  cookieStore.set("unify_user", "", expiredOptions);
}

import { NextResponse } from "next/server";
import { getRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { getBackendUrl } from "@/lib/auth/config";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token available", isAuthenticated: false },
      { status: 401 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401 || res.status === 403) {
      // Definitive authentication failure (revoked, expired, reuse detected)
      await clearAuthCookies();
      return NextResponse.json(
        {
          error: data?.error || "Session expired or invalid",
          code: data?.code || "UNAUTHENTICATED",
          isAuthenticated: false,
        },
        { status: 401 }
      );
    }

    if (!res.ok) {
      // Temporary backend or 5xx error: do not destroy potentially valid session cookies
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable" },
        { status: 503 }
      );
    }

    const { accessToken, refreshToken: newRefreshToken, user } = data || {};
    if (!accessToken || !newRefreshToken) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: "Invalid token response from backend", isAuthenticated: false },
        { status: 502 }
      );
    }

    // Rotate cookies securely on server with lifetimes determined by the backend
    await setAuthCookies(accessToken, newRefreshToken, {
      maxAge: data.expiresIn,
      refreshMaxAge: data.refreshExpiresIn,
    });

    return NextResponse.json(
      {
        ok: true,
        user,
        isAuthenticated: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json(
        { error: "Authentication refresh timed out" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Unable to reach authentication service" },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

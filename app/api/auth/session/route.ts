import { NextResponse } from "next/server";
import {
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies";
import { getBackendUrl } from "@/lib/auth/config";

export async function GET() {
  const backendUrl = getBackendUrl();
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  // Helper for silent session refresh
  async function attemptSilentRefresh(rToken: string) {
    try {
      const refreshRes = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rToken }),
        cache: "no-store",
      });

      if (!refreshRes.ok) {
        if (refreshRes.status === 401 || refreshRes.status === 403) {
          await clearAuthCookies();
        }
        return null;
      }

      const refreshData = await refreshRes.json();
      if (refreshData?.accessToken && refreshData?.refreshToken) {
        await setAuthCookies(refreshData.accessToken, refreshData.refreshToken, {
          maxAge: refreshData.expiresIn,
          refreshMaxAge: refreshData.refreshExpiresIn,
        });
        return refreshData.user;
      }
      return null;
    } catch {
      return null;
    }
  }

  // 1. Try validating current access token
  if (accessToken) {
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(
          {
            isAuthenticated: true,
            user: data.user,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
          }
        );
      }

      // If access token expired and refresh token exists, attempt silent refresh
      if (res.status === 401 && refreshToken) {
        const refreshedUser = await attemptSilentRefresh(refreshToken);
        if (refreshedUser) {
          return NextResponse.json(
            {
              isAuthenticated: true,
              user: refreshedUser,
            },
            {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
              },
            }
          );
        }
      }
    } catch {
      // Backend error or network failure
    }
  } else if (refreshToken) {
    // 2. No access token in cookie, but refresh token exists: attempt recovery
    const refreshedUser = await attemptSilentRefresh(refreshToken);
    if (refreshedUser) {
      return NextResponse.json(
        {
          isAuthenticated: true,
          user: refreshedUser,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }
  }

  return NextResponse.json(
    {
      isAuthenticated: false,
      user: null,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

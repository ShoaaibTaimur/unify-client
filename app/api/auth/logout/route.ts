import { NextResponse } from "next/server";
import { getRefreshToken, getAccessToken, clearAuthCookies } from "@/lib/auth/cookies";
import { getBackendUrl } from "@/lib/auth/config";

export async function POST() {
  const refreshToken = await getRefreshToken();
  const accessToken = await getAccessToken();

  try {
    const backendUrl = getBackendUrl();
    await fetch(`${backendUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    // Report/log error but ensure browser cookies are cleared regardless
  } finally {
    await clearAuthCookies();
  }

  return NextResponse.json({ ok: true });
}

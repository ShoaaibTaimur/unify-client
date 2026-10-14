import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccessToken, clearAuthCookies } from "@/lib/auth/cookies";
import { getBackendUrl, validateOrigin } from "@/lib/auth/config";

const changePasswordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(6),
});

export async function POST(req: Request) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Cross-site requests prohibited" }, { status: 403 });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password fields" }, { status: 400 });
  }

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to change password" },
        { status: res.status }
      );
    }

    // Backend revokes active sessions on password change
    await clearAuthCookies();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach authentication service" },
      { status: 503 }
    );
  }
}

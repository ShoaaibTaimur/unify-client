import { NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getBackendUrl, validateOrigin } from "@/lib/auth/config";

const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Cross-site requests prohibited" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "unify-bff",
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const data = await res.json();
    const { accessToken, refreshToken, user } = data;

    if (!accessToken || !refreshToken || !user) {
      return NextResponse.json(
        { error: "Malformed response from authentication provider" },
        { status: 502 }
      );
    }
    await setAuthCookies(accessToken, refreshToken, {
      maxAge: data.expiresIn,
      refreshMaxAge: data.refreshExpiresIn,
    });

    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json(
        { error: "Authentication service timed out" },
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

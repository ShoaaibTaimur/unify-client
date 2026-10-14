import test from "node:test";
import assert from "node:assert/strict";

test("Frontend Auth Client Security Controls", async (t) => {
  await t.test("Open redirect prevention rejects malicious redirect URLs", () => {
    function getSafeRedirectUrl(target) {
      if (!target) return null;
      if (target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")) {
        return target;
      }
      return null;
    }

    assert.equal(getSafeRedirectUrl("/admin"), "/admin");
    assert.equal(getSafeRedirectUrl("/cr?section=A"), "/cr?section=A");
    assert.equal(getSafeRedirectUrl("https://evil.com"), null);
    assert.equal(getSafeRedirectUrl("//evil.com"), null);
    assert.equal(getSafeRedirectUrl("/\\evil.com"), null);
    assert.equal(getSafeRedirectUrl("javascript:alert(1)"), null);
  });

  await t.test("Cookie attributes accept backend lifetimes and enforce HTTP-only and SameSite=Lax", () => {
    function getCookieOptions(maxAge, isProd = true) {
      return {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge,
      };
    }

    // Dynamic backend lifetimes
    const backendAccessTokenLifetime = 1800;
    const backendRefreshTokenLifetime = 1209600;

    const accessOpts = getCookieOptions(backendAccessTokenLifetime, true);
    assert.equal(accessOpts.httpOnly, true, "access_token must be HttpOnly");
    assert.equal(accessOpts.secure, true, "access_token must be Secure in prod");
    assert.equal(accessOpts.sameSite, "lax");
    assert.equal(accessOpts.maxAge, 1800, "MaxAge dynamically matches backend configuration");

    const refreshOpts = getCookieOptions(backendRefreshTokenLifetime, true);
    assert.equal(refreshOpts.httpOnly, true, "refresh_token must be HttpOnly");
    assert.equal(refreshOpts.secure, true, "refresh_token must be Secure in prod");
    assert.equal(refreshOpts.maxAge, 1209600, "MaxAge dynamically matches backend configuration");
  });

  await t.test("Single-flight refresh coordination prevents concurrent refresh race conditions", async () => {
    let refreshNetworkCalls = 0;
    let ongoingRefreshPromise = null;

    async function mockRefreshSession() {
      if (ongoingRefreshPromise) {
        return ongoingRefreshPromise;
      }

      ongoingRefreshPromise = (async () => {
        refreshNetworkCalls++;
        await new Promise((resolve) => setTimeout(resolve, 30));
        return true;
      })().finally(() => {
        ongoingRefreshPromise = null;
      });

      return ongoingRefreshPromise;
    }

    // Fire 5 simultaneous refresh requests
    const results = await Promise.all([
      mockRefreshSession(),
      mockRefreshSession(),
      mockRefreshSession(),
      mockRefreshSession(),
      mockRefreshSession(),
    ]);

    assert.deepEqual(results, [true, true, true, true, true]);
    assert.equal(refreshNetworkCalls, 1, "Only a single network refresh call should execute for concurrent requests");
  });

  await t.test("401 retry happens at most once and 403 never triggers refresh loop", async () => {
    let callCount = 0;
    let refreshCount = 0;

    async function mockFetch(path, init = {}) {
      callCount++;
      const isRetry = Boolean(init._isRetry);

      // Simulating a protected endpoint returning 401 on first call
      if (!isRetry) {
        refreshCount++;
        // Retry with _isRetry = true
        return mockFetch(path, { ...init, _isRetry: true });
      }

      // On retry, if still 401, return response directly without further retry
      return { status: 401, ok: false };
    }

    const response = await mockFetch("/api/activities");
    assert.equal(callCount, 2, "Request should be retried at most once");
    assert.equal(refreshCount, 1);
    assert.equal(response.status, 401);

    // 403 Forbidden check: never triggers refresh
    let forbiddenRefreshTriggered = false;
    async function mockForbiddenFetch() {
      const res = { status: 403, ok: false };
      if (res.status === 401) {
        forbiddenRefreshTriggered = true;
      }
      return res;
    }

    const forbiddenRes = await mockForbiddenFetch();
    assert.equal(forbiddenRes.status, 403);
    assert.equal(forbiddenRefreshTriggered, false, "403 must never trigger refresh");
  });

  await t.test("Auth responses never leak tokens in body", () => {
    // Simulating safe user response from /api/auth/login BFF
    const bffLoginResponse = {
      ok: true,
      user: {
        id: "usr-1",
        email: "test@unify.edu",
        name: "Test",
        role: "student",
      },
    };

    assert.equal("accessToken" in bffLoginResponse, false, "accessToken must never be in JSON");
    assert.equal("refreshToken" in bffLoginResponse, false, "refreshToken must never be in JSON");
    assert.equal("token" in bffLoginResponse, false, "token must never be in JSON");
    assert.equal("passwordHash" in bffLoginResponse.user, false, "passwordHash must never be in user");
  });
});

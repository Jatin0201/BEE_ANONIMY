const BASE_URL = "http://localhost:5000";
const CLIENT_ORIGIN = "http://localhost:5173";

function updateCookieJar(currentCookies, res) {
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")].filter(Boolean);
  const cookieMap = new Map();

  if (currentCookies) {
    currentCookies.split("; ").forEach(pair => {
      const [k, v] = pair.split("=");
      if (k) cookieMap.set(k, v);
    });
  }

  setCookies.forEach(sc => {
    const parts = sc.split(";");
    const [k, v] = parts[0].split("=");
    const maxAgePart = parts.find(p => p.trim().toLowerCase().startsWith("max-age="));
    if (maxAgePart && maxAgePart.split("=")[1].trim() === "0") {
      cookieMap.delete(k);
    } else if (k && v !== undefined) {
      cookieMap.set(k, v);
    }
  });

  return Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function runTests() {
  console.log("=== Anonimy Better Auth Integration Test Suite ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.status === 200 && data.status === "ok", "Server health check returns 200 OK");
  } catch (err) {
    assert(false, `Server is reachable: ${err.message}`);
  }

  // 2. Unauthenticated access to protected route
  try {
    const res = await fetch(`${BASE_URL}/api/test/protected`, {
      headers: { Origin: CLIENT_ORIGIN },
    });
    assert(res.status === 401, "Unauthenticated request to protected route is rejected with 401");
  } catch (err) {
    assert(false, `Unauthenticated request test failed: ${err.message}`);
  }

  // 3. Signup with invalid password (under 8 chars)
  const testEmail = `test_${Date.now()}@example.com`;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: CLIENT_ORIGIN,
      },
      body: JSON.stringify({
        email: testEmail,
        password: "123", // too short
        name: "Test User",
      }),
    });
    assert(res.status >= 400, "Sign-up with password < 8 chars rejected");
  } catch (err) {
    assert(false, `Invalid password signup test: ${err.message}`);
  }

  // 4. Valid Signup
  let cookies = "";
  const validPassword = "SecurePassword123!";
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: CLIENT_ORIGIN,
      },
      body: JSON.stringify({
        email: testEmail,
        password: validPassword,
        name: "Test User",
      }),
    });
    cookies = updateCookieJar(cookies, res);
    const data = await res.json();
    assert(res.status === 200 && data.user && data.user.email === testEmail, "Valid sign-up succeeds and returns user");
    assert(!data.user.password && !data.user.hash, "Sign-up response does NOT expose password or hash");
    assert(Boolean(cookies), "Sign-up returns session cookie in Set-Cookie header");
  } catch (err) {
    assert(false, `Valid signup test failed: ${err.message}`);
  }

  // 5. Duplicate Signup Rejection
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: CLIENT_ORIGIN,
      },
      body: JSON.stringify({
        email: testEmail,
        password: validPassword,
        name: "Test User 2",
      }),
    });
    assert(res.status >= 400, "Duplicate email registration rejected");
  } catch (err) {
    assert(false, `Duplicate signup test failed: ${err.message}`);
  }

  // 6. Session Retrieval via get-session
  try {
    const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
      headers: {
        Origin: CLIENT_ORIGIN,
        cookie: cookies,
      },
    });
    const data = await res.json();
    assert(res.status === 200 && data && data.user && data.user.email === testEmail, "Session retrieval returns active authenticated user");
  } catch (err) {
    assert(false, `Session retrieval test failed: ${err.message}`);
  }

  // 7. Protected Route with Session Cookie
  try {
    const res = await fetch(`${BASE_URL}/api/test/protected`, {
      headers: {
        Origin: CLIENT_ORIGIN,
        cookie: cookies,
      },
    });
    const data = await res.json();
    assert(res.status === 200 && data.authenticated === true && data.user.email === testEmail, "Protected middleware verifies session and grants access");
  } catch (err) {
    assert(false, `Protected route test failed: ${err.message}`);
  }

  // 8. Invalid Login Rejection
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: CLIENT_ORIGIN,
      },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword999!",
      }),
    });
    assert(res.status >= 400, "Invalid credentials rejected during sign-in");
  } catch (err) {
    assert(false, `Invalid login test failed: ${err.message}`);
  }

  // 9. Valid Login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: CLIENT_ORIGIN,
      },
      body: JSON.stringify({
        email: testEmail,
        password: validPassword,
      }),
    });
    cookies = updateCookieJar(cookies, res);
    const data = await res.json();
    assert(res.status === 200 && data.user && data.user.email === testEmail, "Valid login succeeds and returns user");
    assert(Boolean(cookies), "Valid login issues new session cookie");
  } catch (err) {
    assert(false, `Valid login test failed: ${err.message}`);
  }

  // 10. Logout / Sign-out
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: CLIENT_ORIGIN,
        cookie: cookies,
      },
      body: JSON.stringify({}),
    });
    cookies = updateCookieJar(cookies, res);
    assert(res.status === 200, "Sign-out succeeds with 200 OK");
  } catch (err) {
    assert(false, `Sign-out test failed: ${err.message}`);
  }

  // 11. Verify session invalidation after logout
  try {
    const res = await fetch(`${BASE_URL}/api/test/protected`, {
      headers: {
        Origin: CLIENT_ORIGIN,
        cookie: cookies,
      },
    });
    assert(res.status === 401, "Protected route rejects request after session sign-out");
  } catch (err) {
    assert(false, `Post-logout protected test failed: ${err.message}`);
  }

  console.log(`\n==================================================`);
  console.log(`Test Suite Results: ${passed} passed, ${failed} failed.`);
  console.log(`==================================================\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

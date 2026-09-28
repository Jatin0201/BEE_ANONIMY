import "dotenv/config";
import { app } from "./src/app.js";
import { prisma } from "./src/lib/prisma.js";
import { getOrAssignAlias, generateCandidateAlias, BASE_ALIASES, DESCRIPTORS, NOUNS } from "./src/modules/aliases/alias.service.js";
import { createPost } from "./src/modules/posts/posts.service.js";

function updateCookieJar(currentCookies, res) {
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")].filter(Boolean);
  const cookieMap = new Map();

  if (currentCookies) {
    currentCookies.split("; ").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) cookieMap.set(k, v);
    });
  }

  setCookies.forEach((sc) => {
    const parts = sc.split(";");
    const [k, v] = parts[0].split("=");
    const maxAgePart = parts.find((p) => p.trim().toLowerCase().startsWith("max-age="));
    if (maxAgePart && maxAgePart.split("=")[1]?.trim() === "0") {
      cookieMap.delete(k);
    } else if (k && v !== undefined) {
      cookieMap.set(k, v);
    }
  });

  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function runPostsTestSuite() {
  console.log("=== Anonimy Posts API Test Suite ===\n");
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

  // Start ephemeral server
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

  let createdPostIds = [];
  let testUserIds = [];

  try {
    // ─── Setup User 1 via Sign Up ───────────────────────────────────────────
    const testEmail1 = `tester_posts_${Date.now()}@example.com`;
    const testPassword1 = "StrongPassword123!";

    const signupRes1 = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: clientOrigin,
      },
      body: JSON.stringify({
        email: testEmail1,
        password: testPassword1,
        name: "Test User 1",
      }),
    });

    const signupData1 = await signupRes1.json();
    const user1 = signupData1.user;
    if (user1?.id) {
      testUserIds.push(user1.id);
      // Mark email as verified so sign-in and session verification succeed
      await prisma.user.update({
        where: { id: user1.id },
        data: { emailVerified: true },
      });
    }

    // Sign in with verified user to obtain authenticated session cookie
    const loginRes1 = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: clientOrigin,
      },
      body: JSON.stringify({
        email: testEmail1,
        password: testPassword1,
      }),
    });

    const user1Cookies = updateCookieJar("", loginRes1);
    assert(loginRes1.status === 200 && Boolean(user1Cookies), "User 1 signed in with verified email and received authenticated session cookie");

    // Setup User 2 via Sign Up for session tests
    const testEmail2 = `tester2_auth_${Date.now()}@example.com`;
    const testPassword2 = "StrongPassword123!";
    const signupRes2 = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: clientOrigin },
      body: JSON.stringify({ email: testEmail2, password: testPassword2, name: "Test User 2" }),
    });
    const signupData2 = await signupRes2.json();
    const user2 = signupData2.user;
    if (user2?.id) {
      testUserIds.push(user2.id);
      await prisma.user.update({
        where: { id: user2.id },
        data: { emailVerified: true },
      });
    }

    const loginRes2 = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: clientOrigin },
      body: JSON.stringify({ email: testEmail2, password: testPassword2 }),
    });
    const user2Cookies = updateCookieJar("", loginRes2);

    // ─── 1. Unauthenticated Post Creation Rejection ─────────────────────────
    console.log("\n1. Testing Authentication Enforcement:");
    const unauthRes = await fetch(`${baseUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: clientOrigin,
      },
      body: JSON.stringify({ content: "Hello unauthenticated world" }),
    });
    assert(
      unauthRes.status === 401,
      `POST /api/posts without session returns 401 Unauthorized (got ${unauthRes.status})`
    );

    // ─── 2. Validation Checks ──────────────────────────────────────────────
    console.log("\n2. Testing Validation Constraints:");
    const emptyRes = await fetch(`${baseUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: user1Cookies,
        Origin: clientOrigin,
      },
      body: JSON.stringify({ content: "    " }),
    });
    assert(
      emptyRes.status === 400,
      `POST /api/posts with empty/whitespace content returns 400 Bad Request (got ${emptyRes.status})`
    );

    const tooLongRes = await fetch(`${baseUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: user1Cookies,
        Origin: clientOrigin,
      },
      body: JSON.stringify({ content: "a".repeat(2001) }),
    });
    assert(
      tooLongRes.status === 400,
      `POST /api/posts with content > 2000 chars returns 400 Bad Request (got ${tooLongRes.status})`
    );

    // ─── 3. Authenticated Post Creation & Privacy Sanitization ──────────────
    console.log("\n3. Testing Post Creation & Privacy Sanitization:");
    const postContent = "I finally told my parents that I don't want to become an engineer.";
    const createRes = await fetch(`${baseUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: user1Cookies,
        Origin: clientOrigin,
      },
      body: JSON.stringify({ content: postContent, alias: "Silver Birch" }),
    });

    assert(createRes.status === 201, `POST /api/posts returns 201 Created (got ${createRes.status})`);
    const createData = await createRes.json();
    const createdPost = createData.post;
    if (createdPost?.id) {
      createdPostIds.push(createdPost.id);
    }

    assert(Boolean(createdPost?.id), "Created post has a valid UUID ID");
    assert(createdPost?.content === postContent, "Created post content matches request");
    assert(createdPost?.alias?.name === "Silver Birch", `Created post honored chosen/shuffled alias: "${createdPost?.alias?.name}" === "Silver Birch"`);
    assert(createdPost?.commentCount === 0, "Created post has commentCount = 0");
    assert(Boolean(createdPost?.createdAt), "Created post has createdAt ISO string");

    // CRITICAL: Zero authorId / userId leakage
    assert(
      createdPost?.authorId === undefined &&
      createdPost?.userId === undefined &&
      JSON.stringify(createData).includes(user1.id) === false,
      "CRITICAL PRIVACY GUARANTEE: authorId / userId is NOT present anywhere in the API response"
    );

    // ─── 4. Database Integrity & PostParticipant Constraints ────────────────
    console.log("\n4. Testing Database Integrity & Anonymity Constraints:");
    const dbParticipant = await prisma.postParticipant.findUnique({
      where: {
        postId_userId: {
          postId: createdPost.id,
          userId: user1.id,
        },
      },
    });
    assert(Boolean(dbParticipant), "PostParticipant record was created in database");
    assert(dbParticipant?.alias === createdPost.alias.name, "DB participant alias matches sanitized response");

    // ─── 5. Contextual Alias Assignment & Collision Avoidance ───────────────
    console.log("\n5. Testing Contextual Alias Resolution & Dynamic Combinations:");
    // User 1 gets the same alias when querying their alias in the same post
    const reusedAlias = await getOrAssignAlias(prisma, createdPost.id, user1.id);
    assert(
      reusedAlias === createdPost.alias.name,
      `User 1 retains same alias in Post 1 (${reusedAlias})`
    );

    // User 2 participating in Post 1 MUST get a DIFFERENT alias
    const user2AliasInPost1 = await getOrAssignAlias(prisma, createdPost.id, user2.id);
    assert(
      user2AliasInPost1 !== createdPost.alias.name,
      `User 2 gets a different unique alias in Post 1: "${user2AliasInPost1}" !== "${createdPost.alias.name}"`
    );

    // User 1 creating Post 2 gets a fresh contextual alias
    const post2 = await createPost(user1.id, "Second post by User 1");
    if (post2?.id) createdPostIds.push(post2.id);
    assert(Boolean(post2.id), "User 1 successfully created second post");

    // Dynamic word mixer test: verify combination generation
    const usedSet = new Set(BASE_ALIASES);
    const dynamicCandidate = generateCandidateAlias(usedSet);
    const [desc, noun] = dynamicCandidate.split(" ");
    assert(
      DESCRIPTORS.includes(desc) && NOUNS.includes(noun),
      `Dynamic alias mixer correctly generated organic combination: "${dynamicCandidate}"`
    );

    // ─── 6. Public Feed Listing (GET /api/posts) ───────────────────────────
    console.log("\n6. Testing Public Feed Listing (GET /api/posts):");
    const listRes = await fetch(`${baseUrl}/api/posts?page=1&limit=10&sort=latest`);
    assert(listRes.status === 200, `GET /api/posts returns 200 OK (got ${listRes.status})`);

    const listData = await listRes.json();
    assert(Array.isArray(listData.posts), "Response contains posts array");
    assert(listData.posts.length >= 2, `Feed returns at least 2 posts (got ${listData.posts.length})`);
    assert(Boolean(listData.pagination), "Response contains pagination metadata");
    assert(listData.pagination.total >= 2, `Pagination total >= 2 (got ${listData.pagination.total})`);

    // Verify all posts in feed are sanitized
    const hasLeakage = listData.posts.some(
      (p) => p.authorId !== undefined || p.userId !== undefined
    );
    assert(!hasLeakage, "All posts in public feed listing are sanitized without authorId");

    // Test Search filtering
    const searchRes = await fetch(`${baseUrl}/api/posts?search=engineer`);
    const searchData = await searchRes.json();
    assert(
      searchData.posts.length >= 1 && searchData.posts.some((p) => p.content.includes("engineer")),
      "GET /api/posts?search=engineer filters correctly"
    );

    // ─── 7. Single Post Fetch (GET /api/posts/:id) ─────────────────────────
    console.log("\n7. Testing Single Post Fetch (GET /api/posts/:id):");
    const getSingleRes = await fetch(`${baseUrl}/api/posts/${createdPost.id}`);
    assert(getSingleRes.status === 200, `GET /api/posts/:id returns 200 OK (got ${getSingleRes.status})`);
    const getSingleData = await getSingleRes.json();
    assert(getSingleData.post?.id === createdPost.id, "Fetched post ID matches");
    assert(getSingleData.post?.alias?.name === createdPost.alias.name, "Fetched post alias matches");
    assert(getSingleData.post?.authorId === undefined, "Fetched post does not leak authorId");

    // ─── 8. Authenticated User's Posts (GET /api/posts/me) & isAuthor ──────
    console.log("\n8. Testing Authenticated User's Posts (GET /api/posts/me) & isAuthor:");
    // Unauthenticated request to /me
    const unauthMeRes = await fetch(`${baseUrl}/api/posts/me`);
    assert(unauthMeRes.status === 401, `GET /api/posts/me without session returns 401 Unauthorized (got ${unauthMeRes.status})`);

    // Authenticated request to /me
    const authMeRes = await fetch(`${baseUrl}/api/posts/me`, {
      headers: { cookie: user1Cookies, Origin: clientOrigin },
    });
    assert(authMeRes.status === 200, `GET /api/posts/me with session returns 200 OK (got ${authMeRes.status})`);
    const myPostsData = await authMeRes.json();
    assert(Array.isArray(myPostsData.posts), "GET /api/posts/me returns posts array");
    assert(myPostsData.posts.length >= 2, `GET /api/posts/me returns user's authored posts (got ${myPostsData.posts.length})`);
    assert(myPostsData.posts.every((p) => p.isAuthor === true), "All posts returned by /me have isAuthor = true");

    // Check feed with session for isAuthor flag
    const feedWithAuthRes = await fetch(`${baseUrl}/api/posts?sort=latest`, {
      headers: { cookie: user1Cookies, Origin: clientOrigin },
    });
    const feedWithAuthData = await feedWithAuthRes.json();
    const user1PostInFeed = feedWithAuthData.posts.find((p) => p.id === createdPost.id);
    assert(user1PostInFeed?.isAuthor === true, "User 1's post has isAuthor = true in authenticated feed query");

    // ─── 9. Post Deletion by Owner (DELETE /api/posts/:id) ───────────────────
    console.log("\n9. Testing Post Deletion by Owner (DELETE /api/posts/:id):");
    // Create a temporary post to delete
    const postToDelete = await createPost(user1.id, "Temporary post for deletion testing");
    createdPostIds.push(postToDelete.id);

    // Unauthenticated deletion attempt
    const unauthDeleteRes = await fetch(`${baseUrl}/api/posts/${postToDelete.id}`, {
      method: "DELETE",
    });
    assert(unauthDeleteRes.status === 401, `DELETE /api/posts/:id without session returns 401 Unauthorized (got ${unauthDeleteRes.status})`);

    // Unauthorized deletion attempt (User 2 trying to delete User 1's post)
    const forbiddenDeleteRes = await fetch(`${baseUrl}/api/posts/${postToDelete.id}`, {
      method: "DELETE",
      headers: { cookie: user2Cookies, Origin: clientOrigin },
    });
    assert(
      forbiddenDeleteRes.status === 403,
      `DELETE /api/posts/:id by non-owner returns 403 Forbidden (got ${forbiddenDeleteRes.status})`
    );

    // Authorized deletion by Owner (User 1)
    const ownerDeleteRes = await fetch(`${baseUrl}/api/posts/${postToDelete.id}`, {
      method: "DELETE",
      headers: { cookie: user1Cookies, Origin: clientOrigin },
    });
    assert(ownerDeleteRes.status === 200, `DELETE /api/posts/:id by owner returns 200 OK (got ${ownerDeleteRes.status})`);

    // Verify post is truly gone from DB and API
    const verifyGoneRes = await fetch(`${baseUrl}/api/posts/${postToDelete.id}`);
    assert(verifyGoneRes.status === 404, `GET /api/posts/:id after deletion returns 404 Not Found (got ${verifyGoneRes.status})`);

  } finally {
    // Cleanup
    if (createdPostIds.length > 0) {
      await prisma.post.deleteMany({
        where: { id: { in: createdPostIds } },
      });
    }
    if (testUserIds.length > 0) {
      await prisma.session.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.account.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } },
      });
    }
    server.close();
  }

  console.log(`\n=== Test Suite Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runPostsTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

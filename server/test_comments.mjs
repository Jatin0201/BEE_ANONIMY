import "dotenv/config";
import { app } from "./src/app.js";
import { prisma } from "./src/lib/prisma.js";
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

async function runCommentsTestSuite() {
  console.log("=== Anonimy Comments API Test Suite ===\n");
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
    // ─── Setup User 1 (Post Author & Commenter) ─────────────────────────────
    const email1 = `commenter_author_${Date.now()}@example.com`;
    const password = "StrongPassword123!";

    const signupRes1 = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: clientOrigin },
      body: JSON.stringify({ email: email1, password, name: "User 1" }),
    });
    const signupData1 = await signupRes1.json();
    const user1 = signupData1.user;
    if (user1?.id) {
      testUserIds.push(user1.id);
      await prisma.user.update({
        where: { id: user1.id },
        data: { emailVerified: true },
      });
    }

    const loginRes1 = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: clientOrigin },
      body: JSON.stringify({ email: email1, password }),
    });
    const user1Cookies = updateCookieJar("", loginRes1);
    assert(loginRes1.status === 200 && Boolean(user1Cookies), "User 1 authenticated successfully");

    // ─── Setup User 2 (Distinct Commenter) ───────────────────────────────────
    const email2 = `commenter_user2_${Date.now()}@example.com`;
    const signupRes2 = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: clientOrigin },
      body: JSON.stringify({ email: email2, password, name: "User 2" }),
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
      body: JSON.stringify({ email: email2, password }),
    });
    const user2Cookies = updateCookieJar("", loginRes2);
    assert(loginRes2.status === 200 && Boolean(user2Cookies), "User 2 authenticated successfully");

    // ─── Setup User 3 (Third Commenter) ──────────────────────────────────────
    const user3 = await prisma.user.create({
      data: {
        email: `commenter_user3_${Date.now()}@example.com`,
        name: "User 3",
        emailVerified: true,
      },
    });
    testUserIds.push(user3.id);

    // Create a Post by User 1
    const post1 = await createPost(user1.id, "Main thread post: Sharing thoughts on anonymity.");
    createdPostIds.push(post1.id);
    const authorAliasInPost1 = post1.alias.name;
    assert(Boolean(post1.id), `Created Post 1 with author alias "${authorAliasInPost1}"`);

    // Create a separate Post 2 by User 3 for cross-post isolation testing
    const post2 = await createPost(user3.id, "Second post by User 3 for cross-post isolation.");
    createdPostIds.push(post2.id);

    // ─── 1. Authentication Enforcement ──────────────────────────────────────
    console.log("\n1. Testing Authentication Enforcement:");
    const unauthCommentRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: clientOrigin },
      body: JSON.stringify({ content: "Unauthenticated comment" }),
    });
    assert(
      unauthCommentRes.status === 401,
      `POST /api/posts/:id/comments without session returns 401 Unauthorized (got ${unauthCommentRes.status})`
    );

    // ─── 2. Validation & Error Handling ──────────────────────────────────────
    console.log("\n2. Testing Validation Constraints & Error Handling:");
    // Empty comment
    const emptyCommentRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "   " }),
    });
    assert(
      emptyCommentRes.status === 400,
      `POST comments with whitespace content returns 400 Bad Request (got ${emptyCommentRes.status})`
    );

    // Too long comment
    const tooLongCommentRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "x".repeat(2001) }),
    });
    assert(
      tooLongCommentRes.status === 400,
      `POST comments with >2000 chars returns 400 Bad Request (got ${tooLongCommentRes.status})`
    );

    // Invalid post UUID
    const invalidPostIdRes = await fetch(`${baseUrl}/api/posts/not-a-uuid/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "Valid content" }),
    });
    assert(
      invalidPostIdRes.status === 400,
      `POST comments with invalid post UUID returns 400 Bad Request (got ${invalidPostIdRes.status})`
    );

    // Non-existent post UUID
    const nonExistentPostRes = await fetch(`${baseUrl}/api/posts/00000000-0000-0000-0000-000000000000/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "Valid content" }),
    });
    assert(
      nonExistentPostRes.status === 404,
      `POST comments to non-existent post returns 404 Not Found (got ${nonExistentPostRes.status})`
    );

    // Invalid parentId format
    const invalidParentIdRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "Reply", parentId: "invalid-uuid" }),
    });
    assert(
      invalidParentIdRes.status === 400,
      `POST comments with invalid parentId UUID format returns 400 Bad Request (got ${invalidParentIdRes.status})`
    );

    // Non-existent parentId
    const nonExistentParentRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "Reply", parentId: "00000000-0000-0000-0000-000000000000" }),
    });
    assert(
      nonExistentParentRes.status === 400,
      `POST comments with non-existent parentId returns 400 Bad Request (got ${nonExistentParentRes.status})`
    );

    // ─── 3. Top-Level Comment Creation & Contextual Alias Reuse ───────────────
    console.log("\n3. Testing Top-Level Comment Creation & Contextual Alias Reuse:");
    // User 1 (Author) comments on their own post -> must reuse author's alias
    const authorCommentRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "Author's follow-up comment." }),
    });
    assert(authorCommentRes.status === 201, `Author comment returns 201 Created (got ${authorCommentRes.status})`);
    const authorCommentData = await authorCommentRes.json();
    const comment1 = authorCommentData.comment;

    assert(Boolean(comment1?.id), "Author comment has valid UUID ID");
    assert(comment1?.postId === post1.id, "Comment postId matches target post");
    assert(comment1?.alias?.name === authorAliasInPost1, `Author retains exact post author alias "${comment1?.alias?.name}"`);
    assert(comment1?.content === "Author's follow-up comment.", "Comment content matches request");
    assert(comment1?.parentId === undefined, "Top-level comment does not have parentId");
    assert(comment1?.replyToAlias === undefined, "Top-level comment does not have replyToAlias");

    // Zero authorId / userId leakage
    assert(
      comment1?.authorId === undefined &&
      comment1?.userId === undefined &&
      !JSON.stringify(authorCommentData).includes(user1.id),
      "CRITICAL PRIVACY: Author comment does not leak internal authorId or userId"
    );

    // User 2 comments on Post 1 with chosen/shuffled alias -> must assign chosen alias
    const user2CommentRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user2Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "User 2's perspective on this thread.", alias: "Blue Raven" }),
    });
    assert(user2CommentRes.status === 201, `User 2 comment returns 201 Created (got ${user2CommentRes.status})`);
    const user2CommentData = await user2CommentRes.json();
    const comment2 = user2CommentData.comment;
    const user2AliasInPost1 = comment2?.alias?.name;

    assert(user2AliasInPost1 === "Blue Raven", `User 2 assigned preferred/shuffled alias: "${user2AliasInPost1}" === "Blue Raven"`);
    assert(
      user2AliasInPost1 !== authorAliasInPost1,
      `User 2 alias "${user2AliasInPost1}" is distinct from author alias "${authorAliasInPost1}"`
    );

    // User 2 comments a second time on Post 1 -> must reuse same alias
    const user2SecondCommentRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user2Cookies, Origin: clientOrigin },
      body: JSON.stringify({ content: "User 2's second comment in same thread." }),
    });
    const user2SecondCommentData = await user2SecondCommentRes.json();
    assert(
      user2SecondCommentData.comment?.alias?.name === user2AliasInPost1,
      `User 2 reuses the same alias "${user2AliasInPost1}" for subsequent comments in Post 1`
    );

    // ─── 4. Nested Comment Hierarchy & Replies ───────────────────────────────
    console.log("\n4. Testing Nested Comment Hierarchy & Replies:");
    // User 2 replies to Author's top-level comment
    const reply1Res = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user2Cookies, Origin: clientOrigin },
      body: JSON.stringify({
        content: "Replying to the author's follow-up comment.",
        parentId: comment1.id,
      }),
    });
    assert(reply1Res.status === 201, `Reply returns 201 Created (got ${reply1Res.status})`);
    const reply1Data = await reply1Res.json();
    const reply1 = reply1Data.comment;

    assert(reply1?.parentId === comment1.id, `Reply correctly records parentId "${reply1?.parentId}"`);
    assert(
      reply1?.replyToAlias === authorAliasInPost1,
      `Reply correctly resolves replyToAlias to author's alias "${authorAliasInPost1}" (got "${reply1?.replyToAlias}")`
    );
    assert(reply1?.alias?.name === user2AliasInPost1, `Replier retains their own contextual alias "${user2AliasInPost1}"`);

    // Author (User 1) replies back to User 2's reply
    const reply2Res = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({
        content: "Author answering User 2's reply.",
        parentId: reply1.id,
      }),
    });
    const reply2Data = await reply2Res.json();
    const reply2 = reply2Data.comment;

    assert(reply2?.parentId === reply1.id, "Nested reply records parentId of previous reply");
    assert(
      reply2?.replyToAlias === user2AliasInPost1,
      `Nested reply correctly resolves replyToAlias to "${user2AliasInPost1}"`
    );

    // Cross-post parentId rejection: Attempting to reply to a comment on Post 1 while targeting Post 2
    const crossPostReplyRes = await fetch(`${baseUrl}/api/posts/${post2.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: user1Cookies, Origin: clientOrigin },
      body: JSON.stringify({
        content: "Attempting cross-post reply invalid reference",
        parentId: comment1.id, // belongs to post1, not post2
      }),
    });
    assert(
      crossPostReplyRes.status === 400,
      `Replying with parentId from different post returns 400 Bad Request (got ${crossPostReplyRes.status})`
    );

    // ─── 5. Public Comments Retrieval (GET /api/posts/:id/comments) ──────────
    console.log("\n5. Testing Public Comments Retrieval (GET /api/posts/:id/comments):");
    // Empty comments on Post 2
    const getEmptyCommentsRes = await fetch(`${baseUrl}/api/posts/${post2.id}/comments`);
    assert(getEmptyCommentsRes.status === 200, `GET comments on post with 0 comments returns 200 OK`);
    const emptyCommentsData = await getEmptyCommentsRes.json();
    assert(Array.isArray(emptyCommentsData.comments) && emptyCommentsData.comments.length === 0, "Returns empty comments array");

    // Fetch comments on Post 1
    const getCommentsRes = await fetch(`${baseUrl}/api/posts/${post1.id}/comments`);
    assert(getCommentsRes.status === 200, `GET comments on Post 1 returns 200 OK`);
    const commentsData = await getCommentsRes.json();
    assert(Array.isArray(commentsData.comments), "Response contains comments array");
    assert(commentsData.comments.length === 5, `Post 1 returns exactly 5 comments/replies (got ${commentsData.comments.length})`);

    // Verify chronological order (createdAt ascending)
    let isChronological = true;
    for (let i = 1; i < commentsData.comments.length; i++) {
      const prevDate = new Date(commentsData.comments[i - 1].createdAt).getTime();
      const currDate = new Date(commentsData.comments[i].createdAt).getTime();
      if (currDate < prevDate) {
        isChronological = false;
        break;
      }
    }
    assert(isChronological, "Comments are returned in chronological order (createdAt ascending)");

    // Verify all comments are sanitized without authorId or userId leakage
    const hasLeakage = commentsData.comments.some(
      (c) => c.authorId !== undefined || c.userId !== undefined
    );
    assert(!hasLeakage, "All comments in public list are strictly sanitized (no authorId / userId)");

    // 404 on non-existent post comments
    const nonExistentGetRes = await fetch(`${baseUrl}/api/posts/00000000-0000-0000-0000-000000000000/comments`);
    assert(nonExistentGetRes.status === 404, `GET comments for non-existent post returns 404 Not Found (got ${nonExistentGetRes.status})`);

    // 400 on invalid UUID
    const invalidGetRes = await fetch(`${baseUrl}/api/posts/invalid-uuid/comments`);
    assert(invalidGetRes.status === 400, `GET comments with invalid UUID returns 400 Bad Request (got ${invalidGetRes.status})`);

    // ─── 6. Post Comment Count Synchronization ──────────────────────────────
    console.log("\n6. Testing Post Comment Count Synchronization:");
    const getPostRes = await fetch(`${baseUrl}/api/posts/${post1.id}`);
    const postData = await getPostRes.json();
    assert(
      postData.post?.commentCount === 5,
      `GET /api/posts/:id returns updated commentCount = 5 (got ${postData.post?.commentCount})`
    );

    const getFeedRes = await fetch(`${baseUrl}/api/posts`);
    const feedData = await getFeedRes.json();
    const feedPost1 = feedData.posts.find((p) => p.id === post1.id);
    assert(
      feedPost1?.commentCount === 5,
      `GET /api/posts feed listing returns updated commentCount = 5 (got ${feedPost1?.commentCount})`
    );

  } finally {
    // Cleanup created posts, comments, participants, users
    if (createdPostIds.length > 0) {
      await prisma.comment.deleteMany({
        where: { postId: { in: createdPostIds } },
      });
      await prisma.postParticipant.deleteMany({
        where: { postId: { in: createdPostIds } },
      });
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

runCommentsTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

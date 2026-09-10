/**
 * Anonimy — Public-facing domain types
 *
 * These types mirror the sanitized server response shapes documented in
 * DATABASE_DESIGN.md. Internal fields such as authorId are never present
 * on public post/comment responses.
 */

/** The contextual identity a user holds within a specific post. */
export interface Alias {
  /** Display name — e.g. "Silent Fox" */
  name: string;
}

/** A sanitized post as returned by GET /api/posts or GET /api/posts/:id */
export interface Post {
  id: string;
  content: string;
  /** The contextual alias of the post author within this post */
  alias: Alias;
  commentCount: number;
  createdAt: string; // ISO 8601
}

/** A sanitized comment as returned by GET /api/posts/:id/comments */
export interface Comment {
  id: string;
  postId: string;
  content: string;
  /** The contextual alias of the commenter within this post */
  alias: Alias;
  createdAt: string; // ISO 8601
}

/** Minimal user shape — used only for the private profile page */
export interface CurrentUser {
  email: string;
  createdAt: string; // ISO 8601 — used to display "Member since"
}

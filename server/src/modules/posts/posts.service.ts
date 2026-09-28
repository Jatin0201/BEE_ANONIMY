import { prisma } from "../../lib/prisma.js";
import { getOrAssignAlias } from "../aliases/alias.service.js";
import type { GetPostsQuery } from "./posts.schema.js";

export interface SanitizedPost {
  id: string;
  content: string;
  alias: {
    name: string;
  };
  commentCount: number;
  createdAt: string;
  isAuthor?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export class PostServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "PostServiceError";
  }
}

/**
 * Creates a new post and atomically assigns a unique contextual nature alias
 * to the author in the PostParticipant table.
 */
export async function createPost(
  userId: string,
  content: string,
  preferredAlias?: string
): Promise<SanitizedPost> {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the post record
    const post = await tx.post.create({
      data: {
        content,
        authorId: userId,
      },
    });

    // 2. Assign unique post-scoped alias for the author
    const aliasName = await getOrAssignAlias(tx, post.id, userId, preferredAlias);

    // 3. Return strictly sanitized response (authorId excluded, isAuthor true)
    return {
      id: post.id,
      content: post.content,
      alias: {
        name: aliasName,
      },
      commentCount: 0,
      createdAt: post.createdAt.toISOString(),
      isAuthor: true,
    };
  });
}

/**
 * Fetches a paginated list of posts with sorting and optional search filter.
 * Sanitizes all output to ensure zero internal userId / authorId leakage.
 */
export async function getPosts(
  query: GetPostsQuery,
  currentUserId?: string
): Promise<{ posts: SanitizedPost[]; pagination: PaginationMeta }> {
  const { page, limit, sort, search } = query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        content: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const orderBy =
    sort === "top"
      ? [
          {
            comments: {
              _count: "desc" as const,
            },
          },
          {
            createdAt: "desc" as const,
          },
        ]
      : [
          {
            createdAt: "desc" as const,
          },
        ];

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        participants: true,
        _count: {
          select: { comments: true },
        },
      },
    }),
  ]);

  const sanitizedPosts: SanitizedPost[] = posts.map((post) => {
    const authorParticipant = post.participants.find(
      (p: { userId: string; alias: string }) => p.userId === post.authorId
    );
    return {
      id: post.id,
      content: post.content,
      alias: {
        name: authorParticipant?.alias || "Anonymous Nature",
      },
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
      isAuthor: Boolean(currentUserId && post.authorId === currentUserId),
    };
  });

  const totalPages = Math.ceil(total / limit) || (total === 0 ? 1 : 1);

  return {
    posts: sanitizedPosts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page * limit < total,
    },
  };
}

/**
 * Fetches a single post by ID and returns its sanitized representation.
 */
export async function getPostById(
  postId: string,
  currentUserId?: string
): Promise<SanitizedPost | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      participants: true,
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!post) {
    return null;
  }

  const authorParticipant = post.participants.find(
    (p: { userId: string; alias: string }) => p.userId === post.authorId
  );

  return {
    id: post.id,
    content: post.content,
    alias: {
      name: authorParticipant?.alias || "Anonymous Nature",
    },
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
    isAuthor: Boolean(currentUserId && post.authorId === currentUserId),
  };
}

/**
 * Fetches all posts authored by a specific user.
 * Strictly authenticated to the owner.
 */
export async function getMyPosts(userId: string): Promise<SanitizedPost[]> {
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      participants: true,
      _count: {
        select: { comments: true },
      },
    },
  });

  return posts.map((post) => {
    const authorParticipant = post.participants.find(
      (p: { userId: string; alias: string }) => p.userId === userId
    );
    return {
      id: post.id,
      content: post.content,
      alias: {
        name: authorParticipant?.alias || "Anonymous Nature",
      },
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
      isAuthor: true,
    };
  });
}

/**
 * Deletes a post authored by the user.
 * Enforces ownership check and cascades deletion to related records.
 */
export async function deletePost(userId: string, postId: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new PostServiceError("Post not found", 404, "NotFound");
  }

  if (post.authorId !== userId) {
    throw new PostServiceError(
      "You are not authorized to delete this post",
      403,
      "Forbidden"
    );
  }

  await prisma.post.delete({
    where: { id: postId },
  });
}

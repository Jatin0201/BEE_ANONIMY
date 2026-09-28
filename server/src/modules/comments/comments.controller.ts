import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import {
  createCommentSchema,
  getCommentsParamsSchema,
} from "./comments.schema.js";
import {
  createComment,
  getCommentsByPostId,
  CommentServiceError,
} from "./comments.service.js";

/**
 * Helper to extract and validate postId from request parameters.
 */
function extractPostId(params: unknown): string | null {
  const result = getCommentsParamsSchema.safeParse(params);
  if (!result.success) {
    return null;
  }
  return result.data.id || result.data.postId || null;
}

/**
 * Handles adding a comment or reply to a post.
 * Requires authenticated session.
 */
export async function createCommentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Active user session required to comment",
      });
      return;
    }

    const postId = extractPostId(req.params);
    if (!postId) {
      res.status(400).json({
        error: "ValidationError",
        message: "Invalid post ID format. Must be a valid UUID.",
      });
      return;
    }

    const bodyResult = createCommentSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        error: "ValidationError",
        message: bodyResult.error.issues[0]?.message || "Invalid comment data",
        details: bodyResult.error.flatten(),
      });
      return;
    }

    const comment = await createComment(
      userId,
      postId,
      bodyResult.data.content,
      bodyResult.data.parentId,
      bodyResult.data.alias
    );

    res.status(201).json({ comment });
  } catch (error) {
    if (error instanceof CommentServiceError) {
      res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
      return;
    }

    console.error("[comments] Error creating comment:", error);
    res.status(500).json({
      error: "InternalServerError",
      message: "An unexpected error occurred while adding the comment",
    });
  }
}

/**
 * Handles fetching all comments for a post.
 * Public endpoint.
 */
export async function getCommentsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const postId = extractPostId(req.params);
    if (!postId) {
      res.status(400).json({
        error: "ValidationError",
        message: "Invalid post ID format. Must be a valid UUID.",
      });
      return;
    }

    const comments = await getCommentsByPostId(postId);
    if (comments === null) {
      res.status(404).json({
        error: "NotFound",
        message: "Post not found",
      });
      return;
    }

    res.status(200).json({ comments });
  } catch (error) {
    console.error("[comments] Error fetching comments:", error);
    res.status(500).json({
      error: "InternalServerError",
      message: "An unexpected error occurred while fetching comments",
    });
  }
}

import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
/**
 * Handles creation of a new post.
 * Requires authenticated session.
 */
export declare function createPostController(req: AuthenticatedRequest, res: Response): Promise<void>;
/**
 * Handles fetching paginated posts with optional sorting and search.
 * Public endpoint (optionally recognizes authenticated user for isAuthor flag).
 */
export declare function getPostsController(req: AuthenticatedRequest, res: Response): Promise<void>;
/**
 * Handles fetching a single post by UUID.
 * Public endpoint (optionally recognizes authenticated user for isAuthor flag).
 */
export declare function getPostByIdController(req: AuthenticatedRequest, res: Response): Promise<void>;
/**
 * Handles fetching all posts authored by the authenticated user.
 * Protected endpoint.
 */
export declare function getMyPostsController(req: AuthenticatedRequest, res: Response): Promise<void>;
/**
 * Handles deleting a post by its owner.
 * Protected endpoint.
 */
export declare function deletePostController(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=posts.controller.d.ts.map
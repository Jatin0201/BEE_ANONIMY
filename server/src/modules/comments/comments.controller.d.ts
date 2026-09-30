import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
/**
 * Handles adding a comment or reply to a post.
 * Requires authenticated session.
 */
export declare function createCommentController(req: AuthenticatedRequest, res: Response): Promise<void>;
/**
 * Handles fetching all comments for a post.
 * Public endpoint.
 */
export declare function getCommentsController(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=comments.controller.d.ts.map
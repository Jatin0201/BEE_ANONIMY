import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { createCommentController, getCommentsController, } from "./comments.controller.js";
export const commentsRouter = Router({ mergeParams: true });
// Public routes: fetch all comments for a post
commentsRouter.get("/", getCommentsController);
// Protected routes: add a comment or reply (requires valid Better Auth session)
commentsRouter.post("/", requireAuth, createCommentController);
//# sourceMappingURL=comments.routes.js.map
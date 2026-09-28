import { Router } from "express";
import { requireAuth, optionalAuth } from "../../middleware/auth.middleware.js";
import {
  createPostController,
  getPostsController,
  getPostByIdController,
  getMyPostsController,
  deletePostController,
} from "./posts.controller.js";
import { commentsRouter } from "../comments/comments.routes.js";

export const postsRouter = Router();

// Nested comment routes: /api/posts/:id/comments
postsRouter.use("/:id/comments", commentsRouter);

// Specific protected routes (must precede parameterized /:id route)
postsRouter.get("/me", requireAuth, getMyPostsController);

// Public routes (with optional auth for isAuthor determination)
postsRouter.get("/", optionalAuth, getPostsController);
postsRouter.get("/:id", optionalAuth, getPostByIdController);

// Protected routes (require valid Better Auth session)
postsRouter.post("/", requireAuth, createPostController);
postsRouter.delete("/:id", requireAuth, deletePostController);

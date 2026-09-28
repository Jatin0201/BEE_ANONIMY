import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createPostController,
  getPostsController,
  getPostByIdController,
} from "./posts.controller.js";

export const postsRouter = Router();

// Public routes
postsRouter.get("/", getPostsController);
postsRouter.get("/:id", getPostByIdController);

// Protected routes (require valid Better Auth session)
postsRouter.post("/", requireAuth, createPostController);

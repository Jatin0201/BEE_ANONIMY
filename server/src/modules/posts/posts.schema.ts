import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post content cannot be empty")
    .max(2000, "Post content cannot exceed 2000 characters"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const getPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["latest", "top"]).default("latest"),
  search: z.string().trim().optional(),
});

export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>;

export const getPostByIdParamsSchema = z.object({
  id: z.string().uuid("Invalid post ID format"),
});

export type GetPostByIdParams = z.infer<typeof getPostByIdParamsSchema>;

import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment content cannot be empty")
    .max(2000, "Comment content cannot exceed 2000 characters"),
  parentId: z.string().uuid("Invalid parent comment ID format").optional(),
  alias: z
    .string()
    .trim()
    .min(2, "Alias must be at least 2 characters")
    .max(50, "Alias cannot exceed 50 characters")
    .optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const getCommentsParamsSchema = z
  .object({
    id: z.string().uuid("Invalid post ID format").optional(),
    postId: z.string().uuid("Invalid post ID format").optional(),
  })
  .refine((data) => Boolean(data.id || data.postId), {
    message: "Post ID must be provided",
  });

export type GetCommentsParams = z.infer<typeof getCommentsParamsSchema>;

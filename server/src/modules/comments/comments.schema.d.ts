import { z } from "zod";
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    alias: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export declare const getCommentsParamsSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    postId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetCommentsParams = z.infer<typeof getCommentsParamsSchema>;
//# sourceMappingURL=comments.schema.d.ts.map
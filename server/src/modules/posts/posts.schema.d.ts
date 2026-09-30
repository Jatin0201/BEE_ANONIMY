import { z } from "zod";
export declare const createPostSchema: z.ZodObject<{
    content: z.ZodString;
    alias: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export declare const getPostsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodDefault<z.ZodEnum<{
        latest: "latest";
        top: "top";
    }>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>;
export declare const getPostByIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type GetPostByIdParams = z.infer<typeof getPostByIdParamsSchema>;
//# sourceMappingURL=posts.schema.d.ts.map
import type { GetPostsQuery } from "./posts.schema.js";
export interface SanitizedPost {
    id: string;
    content: string;
    alias: {
        name: string;
    };
    commentCount: number;
    createdAt: string;
    isAuthor?: boolean;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}
export declare class PostServiceError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode: number, code: string);
}
/**
 * Creates a new post and atomically assigns a unique contextual nature alias
 * to the author in the PostParticipant table.
 */
export declare function createPost(userId: string, content: string, preferredAlias?: string): Promise<SanitizedPost>;
/**
 * Fetches a paginated list of posts with sorting and optional search filter.
 * Sanitizes all output to ensure zero internal userId / authorId leakage.
 */
export declare function getPosts(query: GetPostsQuery, currentUserId?: string): Promise<{
    posts: SanitizedPost[];
    pagination: PaginationMeta;
}>;
/**
 * Fetches a single post by ID and returns its sanitized representation.
 */
export declare function getPostById(postId: string, currentUserId?: string): Promise<SanitizedPost | null>;
/**
 * Fetches all posts authored by a specific user.
 * Strictly authenticated to the owner.
 */
export declare function getMyPosts(userId: string): Promise<SanitizedPost[]>;
/**
 * Deletes a post authored by the user.
 * Enforces ownership check and cascades deletion to related records.
 */
export declare function deletePost(userId: string, postId: string): Promise<void>;
//# sourceMappingURL=posts.service.d.ts.map
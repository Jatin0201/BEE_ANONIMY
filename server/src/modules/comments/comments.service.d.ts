export interface SanitizedComment {
    id: string;
    postId: string;
    content: string;
    alias: {
        name: string;
    };
    createdAt: string;
    parentId?: string;
    replyToAlias?: string;
}
export declare class CommentServiceError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode: number, code: string);
}
/**
 * Creates a comment or reply on a post.
 * Assigns or reuses the user's contextual alias for this post.
 * If parentId is provided, resolves the parent comment's author alias as replyToAlias.
 */
export declare function createComment(userId: string, postId: string, content: string, parentId?: string, preferredAlias?: string): Promise<SanitizedComment>;
/**
 * Fetches all comments for a post in chronological order.
 * Resolves commenter aliases and parent reply aliases via PostParticipant table.
 * Strips all internal authorId and userId fields.
 */
export declare function getCommentsByPostId(postId: string): Promise<SanitizedComment[] | null>;
//# sourceMappingURL=comments.service.d.ts.map
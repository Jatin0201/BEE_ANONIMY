import { prisma } from "../../lib/prisma.js";
import { getOrAssignAlias } from "../aliases/alias.service.js";
export class CommentServiceError extends Error {
    statusCode;
    code;
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "CommentServiceError";
    }
}
/**
 * Creates a comment or reply on a post.
 * Assigns or reuses the user's contextual alias for this post.
 * If parentId is provided, resolves the parent comment's author alias as replyToAlias.
 */
export async function createComment(userId, postId, content, parentId, preferredAlias) {
    return await prisma.$transaction(async (tx) => {
        // 1. Verify post exists
        const post = await tx.post.findUnique({
            where: { id: postId },
            select: { id: true },
        });
        if (!post) {
            throw new CommentServiceError("Post not found", 404, "NotFound");
        }
        let replyToAlias;
        // 2. If this is a reply, verify parent comment exists and belongs to the same post
        if (parentId) {
            const parentComment = await tx.comment.findUnique({
                where: { id: parentId },
                select: {
                    id: true,
                    postId: true,
                    authorId: true,
                },
            });
            if (!parentComment || parentComment.postId !== postId) {
                throw new CommentServiceError("Parent comment not found on this post", 400, "ValidationError");
            }
            // Resolve the parent author's contextual alias in this post
            const parentParticipant = await tx.postParticipant.findUnique({
                where: {
                    postId_userId: {
                        postId,
                        userId: parentComment.authorId,
                    },
                },
                select: { alias: true },
            });
            replyToAlias = parentParticipant?.alias || "Anonymous Nature";
        }
        // 3. Atomically get or assign contextual alias for current user in this post
        const aliasName = await getOrAssignAlias(tx, postId, userId, preferredAlias);
        // 4. Create the comment record
        const comment = await tx.comment.create({
            data: {
                postId,
                authorId: userId,
                content,
                parentId: parentId || null,
            },
        });
        // 5. Return strictly sanitized response (authorId / userId stripped)
        return {
            id: comment.id,
            postId: comment.postId,
            content: comment.content,
            alias: {
                name: aliasName,
            },
            createdAt: comment.createdAt.toISOString(),
            ...(comment.parentId ? { parentId: comment.parentId } : {}),
            ...(replyToAlias ? { replyToAlias } : {}),
        };
    });
}
/**
 * Fetches all comments for a post in chronological order.
 * Resolves commenter aliases and parent reply aliases via PostParticipant table.
 * Strips all internal authorId and userId fields.
 */
export async function getCommentsByPostId(postId) {
    // 1. Check if post exists
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
    });
    if (!post) {
        return null;
    }
    // 2. Fetch comments and participants in parallel
    const [comments, participants] = await Promise.all([
        prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "asc" },
            include: {
                parent: {
                    select: {
                        id: true,
                        authorId: true,
                    },
                },
            },
        }),
        prisma.postParticipant.findMany({
            where: { postId },
            select: {
                userId: true,
                alias: true,
            },
        }),
    ]);
    const userAliasMap = new Map(participants.map((p) => [p.userId, p.alias]));
    // 3. Map to sanitized comment objects
    return comments.map((comment) => {
        const commenterAlias = userAliasMap.get(comment.authorId) || "Anonymous Nature";
        const parentAuthorAlias = comment.parent
            ? userAliasMap.get(comment.parent.authorId) || "Anonymous Nature"
            : undefined;
        return {
            id: comment.id,
            postId: comment.postId,
            content: comment.content,
            alias: {
                name: commenterAlias,
            },
            createdAt: comment.createdAt.toISOString(),
            ...(comment.parentId ? { parentId: comment.parentId } : {}),
            ...(parentAuthorAlias ? { replyToAlias: parentAuthorAlias } : {}),
        };
    });
}
//# sourceMappingURL=comments.service.js.map
import { createPostSchema, getPostsQuerySchema, getPostByIdParamsSchema, } from "./posts.schema.js";
import { createPost, getPosts, getPostById, getMyPosts, deletePost, PostServiceError, } from "./posts.service.js";
/**
 * Handles creation of a new post.
 * Requires authenticated session.
 */
export async function createPostController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Active user session required to create a post",
            });
            return;
        }
        const parseResult = createPostSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                error: "ValidationError",
                message: parseResult.error.issues[0]?.message || "Invalid post data",
                details: parseResult.error.flatten(),
            });
            return;
        }
        const post = await createPost(userId, parseResult.data.content, parseResult.data.alias);
        res.status(201).json({ post });
    }
    catch (error) {
        console.error("[posts] Error creating post:", error);
        res.status(500).json({
            error: "InternalServerError",
            message: "An unexpected error occurred while creating the post",
        });
    }
}
/**
 * Handles fetching paginated posts with optional sorting and search.
 * Public endpoint (optionally recognizes authenticated user for isAuthor flag).
 */
export async function getPostsController(req, res) {
    try {
        const parseResult = getPostsQuerySchema.safeParse(req.query);
        if (!parseResult.success) {
            res.status(400).json({
                error: "ValidationError",
                message: parseResult.error.issues[0]?.message || "Invalid query parameters",
                details: parseResult.error.flatten(),
            });
            return;
        }
        const currentUserId = req.user?.id;
        const result = await getPosts(parseResult.data, currentUserId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("[posts] Error fetching posts:", error);
        res.status(500).json({
            error: "InternalServerError",
            message: "An unexpected error occurred while fetching posts",
        });
    }
}
/**
 * Handles fetching a single post by UUID.
 * Public endpoint (optionally recognizes authenticated user for isAuthor flag).
 */
export async function getPostByIdController(req, res) {
    try {
        const parseResult = getPostByIdParamsSchema.safeParse(req.params);
        if (!parseResult.success) {
            res.status(400).json({
                error: "ValidationError",
                message: "Invalid post ID format. Must be a valid UUID.",
            });
            return;
        }
        const currentUserId = req.user?.id;
        const post = await getPostById(parseResult.data.id, currentUserId);
        if (!post) {
            res.status(404).json({
                error: "NotFound",
                message: "Post not found",
            });
            return;
        }
        res.status(200).json({ post });
    }
    catch (error) {
        console.error("[posts] Error fetching post by id:", error);
        res.status(500).json({
            error: "InternalServerError",
            message: "An unexpected error occurred while fetching the post",
        });
    }
}
/**
 * Handles fetching all posts authored by the authenticated user.
 * Protected endpoint.
 */
export async function getMyPostsController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Active user session required",
            });
            return;
        }
        const posts = await getMyPosts(userId);
        res.status(200).json({ posts });
    }
    catch (error) {
        console.error("[posts] Error fetching user's posts:", error);
        res.status(500).json({
            error: "InternalServerError",
            message: "An unexpected error occurred while fetching your posts",
        });
    }
}
/**
 * Handles deleting a post by its owner.
 * Protected endpoint.
 */
export async function deletePostController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Active user session required to delete a post",
            });
            return;
        }
        const parseResult = getPostByIdParamsSchema.safeParse(req.params);
        if (!parseResult.success) {
            res.status(400).json({
                error: "ValidationError",
                message: "Invalid post ID format. Must be a valid UUID.",
            });
            return;
        }
        await deletePost(userId, parseResult.data.id);
        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof PostServiceError) {
            res.status(error.statusCode).json({
                error: error.code,
                message: error.message,
            });
            return;
        }
        console.error("[posts] Error deleting post:", error);
        res.status(500).json({
            error: "InternalServerError",
            message: "An unexpected error occurred while deleting the post",
        });
    }
}
//# sourceMappingURL=posts.controller.js.map
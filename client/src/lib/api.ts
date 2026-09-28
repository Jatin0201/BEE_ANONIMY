import type { Post, Comment } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface GetPostsResponse {
  posts: Post[];
  pagination: PaginationMeta;
}

export interface GetPostResponse {
  post: Post;
}

export interface CreatePostResponse {
  post: Post;
}

export interface GetMyPostsResponse {
  posts: Post[];
}

export interface DeletePostResponse {
  message: string;
}

export interface GetCommentsResponse {
  comments: Comment[];
}

export interface CreateCommentResponse {
  comment: Comment;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}

export const api = {
  /**
   * Fetches paginated posts from the backend.
   */
  getPosts: (params?: {
    page?: number;
    limit?: number;
    sort?: "latest" | "top";
    search?: string;
  }): Promise<GetPostsResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.sort) query.set("sort", params.sort);
    if (params?.search && params.search.trim()) query.set("search", params.search.trim());

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return request<GetPostsResponse>(`/api/posts${queryString}`);
  },

  /**
   * Fetches a single post by UUID.
   */
  getPostById: (postId: string): Promise<GetPostResponse> => {
    return request<GetPostResponse>(`/api/posts/${postId}`);
  },

  /**
   * Creates a new post on the backend.
   */
  createPost: (content: string, alias?: string): Promise<CreatePostResponse> => {
    return request<CreatePostResponse>("/api/posts", {
      method: "POST",
      body: JSON.stringify({ content, alias }),
    });
  },

  /**
   * Fetches posts authored by the currently authenticated user.
   */
  getMyPosts: (): Promise<GetMyPostsResponse> => {
    return request<GetMyPostsResponse>("/api/posts/me");
  },

  /**
   * Deletes a post owned by the currently authenticated user.
   */
  deletePost: (postId: string): Promise<DeletePostResponse> => {
    return request<DeletePostResponse>(`/api/posts/${postId}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetches all comments for a post in chronological order.
   */
  getComments: (postId: string): Promise<GetCommentsResponse> => {
    return request<GetCommentsResponse>(`/api/posts/${postId}/comments`);
  },

  /**
   * Adds a comment or reply to a post.
   */
  createComment: (
    postId: string,
    content: string,
    parentId?: string,
    alias?: string
  ): Promise<CreateCommentResponse> => {
    return request<CreateCommentResponse>(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId, alias }),
    });
  },
};

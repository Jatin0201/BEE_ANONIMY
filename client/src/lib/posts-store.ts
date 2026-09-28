import { useEffect, useState } from 'react';
import type { Post, Comment } from '@/types';
import { mockPosts as initialMockPosts, mockComments as initialMockComments } from '@/data/mockData';

const STORAGE_KEYS = {
  POSTS: 'anonimy_posts',
  COMMENTS: 'anonimy_comments',
  THREAD_ALIASES: 'anonimy_user_thread_aliases',
  MY_POSTS: 'anonimy_my_created_posts',
};

// Posts from other mock users in prototype seed data
const OTHER_USERS_MOCK_POST_IDS = new Set(['post-2', 'post-3', 'post-4', 'post-5', 'post-6']);

// In-memory fallback if localStorage isn't available or before initialization
let memoryPosts: Post[] = [];
let memoryComments: Record<string, Comment[]> = {};
let memoryThreadAliases: Record<string, string> = {};
let memoryMyPostIds: Set<string> = new Set(['post-1']);

// Listeners for store updates
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch {
      // ignore listener errors
    }
  });
}

function initStore() {
  if (typeof window === 'undefined') return;

  try {
    const storedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (storedPosts) {
      memoryPosts = JSON.parse(storedPosts);
    } else {
      memoryPosts = [...initialMockPosts];
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(memoryPosts));
    }

    const storedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (storedComments) {
      memoryComments = JSON.parse(storedComments);
    } else {
      memoryComments = { ...initialMockComments };
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(memoryComments));
    }

    const storedAliases = localStorage.getItem(STORAGE_KEYS.THREAD_ALIASES);
    if (storedAliases) {
      memoryThreadAliases = JSON.parse(storedAliases);
    }

    const storedMyPosts = localStorage.getItem(STORAGE_KEYS.MY_POSTS);
    if (storedMyPosts) {
      memoryMyPostIds = new Set(JSON.parse(storedMyPosts));
    } else {
      memoryMyPostIds = new Set(['post-1']);
    }

    // Auto-detect and register any user-created posts
    memoryPosts.forEach(p => {
      if (!OTHER_USERS_MOCK_POST_IDS.has(p.id)) {
        memoryMyPostIds.add(p.id);
        if (p.alias?.name) {
          memoryThreadAliases[p.id] = p.alias.name;
        }
      }
    });

    localStorage.setItem(STORAGE_KEYS.MY_POSTS, JSON.stringify(Array.from(memoryMyPostIds)));
    localStorage.setItem(STORAGE_KEYS.THREAD_ALIASES, JSON.stringify(memoryThreadAliases));
  } catch {
    memoryPosts = [...initialMockPosts];
    memoryComments = { ...initialMockComments };
  }
}

// Run initial load
initStore();

/**
 * Returns all posts with dynamically computed comment count.
 */
export function getStoredPosts(): Post[] {
  return memoryPosts.map(post => {
    const postComments = memoryComments[post.id] || [];
    return {
      ...post,
      commentCount: postComments.length,
    };
  });
}

/**
 * Returns a specific post with its dynamic comment count.
 */
export function getStoredPostById(postId: string): Post | undefined {
  const post = memoryPosts.find(p => p.id === postId);
  if (!post) return undefined;
  const postComments = memoryComments[post.id] || [];
  return {
    ...post,
    commentCount: postComments.length,
  };
}

/**
 * Checks if the current user created this post.
 */
export function isUserPostAuthor(postId: string): boolean {
  if (!postId) return false;
  if (memoryMyPostIds.has(postId)) return true;
  // If not in other mock posts list, treat as user's post
  if (!OTHER_USERS_MOCK_POST_IDS.has(postId)) {
    const post = memoryPosts.find(p => p.id === postId);
    if (post) {
      memoryMyPostIds.add(postId);
      if (post.alias?.name) {
        memoryThreadAliases[postId] = post.alias.name;
      }
      return true;
    }
  }
  return false;
}

/**
 * Returns all comments (including replies) for a specific post.
 */
export function getStoredComments(postId: string): Comment[] {
  return memoryComments[postId] || [];
}

/**
 * Adds a new post to the store.
 */
export function createStoredPost(content: string, aliasName: string): Post {
  const newPost: Post = {
    id: `post-${Date.now()}`,
    content,
    alias: { name: aliasName },
    commentCount: 0,
    createdAt: new Date().toISOString(),
  };

  memoryPosts = [newPost, ...memoryPosts];
  memoryComments[newPost.id] = [];

  // Track as user-created post and immediately lock author's alias for this post thread
  memoryMyPostIds.add(newPost.id);
  memoryThreadAliases[newPost.id] = aliasName;

  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(memoryPosts));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(memoryComments));
    localStorage.setItem(STORAGE_KEYS.MY_POSTS, JSON.stringify(Array.from(memoryMyPostIds)));
    localStorage.setItem(STORAGE_KEYS.THREAD_ALIASES, JSON.stringify(memoryThreadAliases));
  } catch {
    // ignore quota/storage issues
  }

  notifyListeners();
  return newPost;
}

/**
 * Adds a comment or reply to a post and dynamically updates the post count.
 */
export function addStoredComment(
  postId: string,
  params: {
    content: string;
    aliasName: string;
    parentId?: string;
    replyToAlias?: string;
  }
): Comment {
  const newComment: Comment = {
    id: `c-${postId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    postId,
    content: params.content,
    alias: { name: params.aliasName },
    createdAt: new Date().toISOString(),
    parentId: params.parentId,
    replyToAlias: params.replyToAlias,
  };

  const existing = memoryComments[postId] || [];
  memoryComments[postId] = [...existing, newComment];

  // Also update user's locked alias for this thread
  setUserThreadAlias(postId, params.aliasName);

  try {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(memoryComments));
  } catch {
    // ignore
  }

  notifyListeners();
  return newComment;
}

/**
 * Gets the locked alias for the user in a post thread.
 */
export function getUserThreadAlias(postId: string): string | null {
  if (memoryThreadAliases[postId]) {
    return memoryThreadAliases[postId];
  }
  if (isUserPostAuthor(postId)) {
    const post = memoryPosts.find(p => p.id === postId);
    if (post?.alias?.name) {
      memoryThreadAliases[postId] = post.alias.name;
      return post.alias.name;
    }
  }
  return null;
}

/**
 * Sets and locks the user's alias in a post thread.
 */
export function setUserThreadAlias(postId: string, aliasName: string) {
  memoryThreadAliases[postId] = aliasName;
  try {
    localStorage.setItem(STORAGE_KEYS.THREAD_ALIASES, JSON.stringify(memoryThreadAliases));
  } catch {
    // ignore
  }
}

/**
 * React hook to subscribe to real-time changes in the posts/comments store.
 */
export function usePostsStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    posts: getStoredPosts(),
    getPostById: getStoredPostById,
    getComments: getStoredComments,
    createPost: createStoredPost,
    addComment: addStoredComment,
    getUserThreadAlias,
    setUserThreadAlias,
    isUserPostAuthor,
  };
}

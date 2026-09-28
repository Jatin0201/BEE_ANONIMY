import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreHorizontal,
  Heart,
  Share2,
  Flag,
  Check,
  MessageSquare,
  CornerDownRight,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Trash2,
  RotateCw,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { AliasAvatar } from "@/components/AliasAvatar";
import type { Post, Comment } from "@/types";

const CURATED_ALIASES = [
  "Silent Fox",
  "Blue Raven",
  "Quiet Oak",
  "Hidden Sun",
  "Pale Wolf",
  "Amber Crane",
  "Cedar Lynx",
  "Golden Fern",
  "Silver Birch",
  "Morning Mist",
  "Quiet Brook",
  "Shadow Moss",
  "Echo Pine",
  "Wild Sage",
  "Frost Wren",
];

// ─── Post Detail Skeleton Loader ───────────────────────────────────────────
function PostDetailSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse">
      {/* Back link skeleton */}
      <div className="w-24 h-4 bg-[#EFEAE4] rounded-md mb-2" />

      {/* Author header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#EFEAE4]" />
          <div className="flex flex-col gap-1.5">
            <div className="w-28 h-4 bg-[#EFEAE4] rounded-md" />
            <div className="w-16 h-3 bg-[#F5EFEB] rounded-md" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col gap-2 my-2">
        <div className="w-full h-6 bg-[#EFEAE4] rounded-md" />
        <div className="w-3/4 h-6 bg-[#EFEAE4] rounded-md" />
      </div>

      <hr className="border-t border-[var(--color-border)] my-2" />

      {/* Comments section skeleton */}
      <div className="flex flex-col gap-4">
        <div className="w-24 h-4 bg-[#EFEAE4] rounded-md" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EFEAE4]" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="w-24 h-3.5 bg-[#EFEAE4] rounded-md" />
            <div className="w-4/5 h-4 bg-[#F5EFEB] rounded-md" />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EFEAE4]" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="w-24 h-3.5 bg-[#EFEAE4] rounded-md" />
            <div className="w-3/5 h-4 bg-[#F5EFEB] rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Detail Page Component ────────────────────────────────────────────

export default function PostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Replying state (Instagram-style)
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    aliasName: string;
  } | null>(null);

  const [commentText, setCommentText] = useState("");
  const [userAssignedAlias, setUserAssignedAlias] = useState<string | null>(null);
  const [commentAliasIndex, setCommentAliasIndex] = useState(() =>
    Math.floor(Math.random() * CURATED_ALIASES.length)
  );
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [collapsedReplyThreads, setCollapsedReplyThreads] = useState<Set<string>>(new Set());

  const commentInputRef = useRef<HTMLInputElement>(null);

  const [reloadToken, setReloadToken] = useState(0);

  // Fetch post and comments from Backend API
  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      if (!postId) {
        if (isMounted) {
          setErrorMessage("No post ID specified");
          setIsLoading(false);
        }
        return;
      }

      try {
        const [postRes, commentsRes] = await Promise.all([
          api.getPostById(postId),
          api.getComments(postId),
        ]);

        if (isMounted) {
          setPost(postRes.post);
          setComments(commentsRes.comments);
          setErrorMessage(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("[post-detail] Failed to load post:", err);
          if (err instanceof ApiError && err.status === 404) {
            setPost(null);
          } else {
            setErrorMessage(
              err instanceof ApiError
                ? err.message
                : "Could not load post details. Please check your connection."
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId, reloadToken]);

  const handleRetry = () => {
    setIsLoading(true);
    setReloadToken(t => t + 1);
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (notificationToast) {
      const timer = setTimeout(() => setNotificationToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationToast]);

  const showToast = (message: string) => {
    setNotificationToast(message);
  };

  const handleToggleLike = (commentId: string) => {
    setLikedCommentIds(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const handleInitiateReply = (commentId: string, authorAlias: string) => {
    setReplyingTo({
      commentId,
      aliasName: authorAlias,
    });

    // Ensure replies thread is expanded if it was collapsed
    setCollapsedReplyThreads(prev => {
      const next = new Set(prev);
      next.delete(commentId);
      return next;
    });

    // Focus input
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleToggleThreadReplies = (commentId: string) => {
    setCollapsedReplyThreads(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // Submit comment or reply to Backend API
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || !postId || isSubmitting) return;

    setIsSubmitting(true);
    const wasReplying = Boolean(replyingTo);
    const replyTarget = replyingTo?.aliasName;

    try {
      const res = await api.createComment(
        postId,
        trimmed,
        replyingTo?.commentId,
        activeCommenterAlias
      );

      const newComment = res.comment;
      setUserAssignedAlias(newComment.alias.name);

      // Append new comment to comments list
      setComments(prev => [...prev, newComment]);

      // Increment post comment count
      if (post) {
        setPost({
          ...post,
          commentCount: post.commentCount + 1,
        });
      }

      setCommentText("");
      setReplyingTo(null);

      if (wasReplying) {
        showToast(`Reply to @${replyTarget} posted as ${newComment.alias.name}`);
      } else {
        showToast(`Comment posted as ${newComment.alias.name}`);
      }
    } catch (err) {
      console.error("[post-detail] Error adding comment:", err);
      showToast(
        err instanceof ApiError
          ? err.message
          : "Failed to submit comment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setIsMenuOpen(false);
    showToast("Post link copied to clipboard");
  };

  const handleReportPost = () => {
    setIsMenuOpen(false);
    showToast("Post reported to moderation team");
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!window.confirm("Are you sure you want to delete this post? This thread and all its comments will be permanently deleted.")) {
      return;
    }
    try {
      await api.deletePost(post.id);
      setIsMenuOpen(false);
      showToast("Post deleted successfully");
      setTimeout(() => {
        navigate("/feed");
      }, 400);
    } catch (err) {
      console.error("[post-detail] Failed to delete post:", err);
      showToast(
        err instanceof ApiError ? err.message : "Failed to delete post. Please try again."
      );
    }
  };

  // Group comments: top-level vs replies
  const topLevelComments = useMemo(() => {
    return comments.filter(c => !c.parentId);
  }, [comments]);

  const repliesByParentId = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    comments.forEach(c => {
      if (c.parentId) {
        if (!map[c.parentId]) {
          map[c.parentId] = [];
        }
        map[c.parentId].push(c);
      }
    });
    return map;
  }, [comments]);

  // Determine taken aliases in this thread to avoid collisions in shuffle
  const usedAliasesInPost = useMemo(() => {
    const set = new Set<string>();
    if (post?.alias?.name) set.add(post.alias.name);
    comments.forEach(c => {
      if (c.alias?.name) set.add(c.alias.name);
    });
    return set;
  }, [post, comments]);

  const availableAliases = useMemo(() => {
    const filtered = CURATED_ALIASES.filter(a => !usedAliasesInPost.has(a));
    return filtered.length > 0 ? filtered : CURATED_ALIASES;
  }, [usedAliasesInPost]);

  // Is user's alias locked in this post (e.g. they authored the post or already commented)
  const isAliasLocked = Boolean(post?.isAuthor || userAssignedAlias);
  const lockedAlias = post?.isAuthor ? post.alias.name : userAssignedAlias;

  const activeCommenterAlias = isAliasLocked
    ? lockedAlias!
    : availableAliases[commentAliasIndex % availableAliases.length] || "Silent Fox";

  const handleRerollCommentAlias = () => {
    if (isAliasLocked || availableAliases.length === 0) return;
    setCommentAliasIndex(prev => prev + 1);
    const nextAlias =
      availableAliases[(commentAliasIndex + 1) % availableAliases.length];
    showToast(`Comment alias changed to ${nextAlias}`);
  };

  // Loading State
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex justify-center py-8 px-4 sm:px-6"
        style={{
          backgroundColor: "#FAF7F4",
          fontFamily: "var(--font-ui)",
          color: "var(--color-text-primary)",
        }}
      >
        <main className="w-full max-w-xl flex flex-col">
          <PostDetailSkeleton />
        </main>
      </div>
    );
  }

  // Error / Post Not Found State
  if (!post || errorMessage) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{
          backgroundColor: "#FAF7F4",
          fontFamily: "var(--font-ui)",
          color: "var(--color-text-primary)",
        }}
      >
        <div className="w-12 h-12 rounded-full bg-[#EFEAE4] flex items-center justify-center mb-4 text-[var(--color-text-secondary)]">
          <MessageSquare size={22} />
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          {errorMessage || "Post not found"}
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mb-6 max-w-xs">
          {errorMessage
            ? "There was an issue loading this thread from the server."
            : "The post you are looking for may have been removed or does not exist."}
        </p>
        <div className="flex items-center gap-3">
          {errorMessage && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-full text-xs font-medium bg-[#EFEAE4] text-[var(--color-text-primary)] hover:bg-[#E5DACD] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          )}
          <Link
            to="/feed"
            className="px-5 py-2 rounded-full text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#2E2E2E] transition-colors"
            style={{ textDecoration: "none" }}
          >
            Return to feed
          </Link>
        </div>
      </div>
    );
  }

  const totalCommentCount = comments.length;

  return (
    <div
      className="min-h-screen flex justify-center py-8 px-4 sm:px-6"
      style={{
        backgroundColor: "#FAF7F4",
        fontFamily: "var(--font-ui)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* ── Toast Notification ────────────────────────────────────────── */}
      {notificationToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-sm shadow-md flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{
            backgroundColor: "#1A1A1A",
            color: "#FFFFFF",
            borderColor: "#333333",
          }}
        >
          <Check size={16} className="text-[#C07B5A]" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* ── Main Post Detail Column ───────────────────────────────────── */}
      <main className="w-full max-w-xl flex flex-col">

        {/* ── 1) Back to feed header ───────────────────────────────────── */}
        <div className="mb-6">
          <Link
            to="/feed"
            className="inline-flex items-center gap-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:text-[#C07B5A] transition-colors group cursor-pointer"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back to feed</span>
          </Link>
        </div>

        {/* ── 2) Author Card Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-2 mb-5">
          <div className="flex items-center gap-3">
            <AliasAvatar name={post.alias.name} size={42} />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-semibold text-[var(--color-text-primary)]">
                  {post.alias.name}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EFEAE4] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  Author
                </span>
                {post.isAuthor && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#EFEAE4] text-[#7A6B5D] border border-[#DCD3C7]">
                    You
                  </span>
                )}
              </div>
              <time className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {formatRelativeTime(post.createdAt)}
              </time>
            </div>
          </div>

          {/* 3 dots menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#EFEAE4] transition-colors cursor-pointer"
              aria-label="Post options"
            >
              <MoreHorizontal size={19} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-30 w-40 bg-white rounded-xl shadow-md border border-[var(--color-border)] py-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-3.5 py-2 text-left text-xs text-[var(--color-text-primary)] hover:bg-[#FAF7F4] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Share2 size={14} className="text-[var(--color-text-muted)]" />
                  <span>Copy link</span>
                </button>
                {post.isAuthor ? (
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-3.5 py-2 text-left text-xs text-[#B94A48] hover:bg-[#FDF2F2] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 size={14} className="text-[#B94A48]" />
                    <span>Delete post</span>
                  </button>
                ) : (
                  <button
                    onClick={handleReportPost}
                    className="w-full px-3.5 py-2 text-left text-xs text-[#B94A48] hover:bg-[#FDF2F2] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Flag size={14} className="text-[#B94A48]" />
                    <span>Report post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 3) Editorial Post Content ─────────────────────────────────── */}
        <div className="my-3">
          <h1
            className="text-2xl md:text-[26px] leading-[1.35] text-[var(--color-text-primary)] font-normal tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {post.content}
          </h1>
        </div>

        {/* ── 4) Thin Divider ───────────────────────────────────────────── */}
        <hr className="border-t border-[var(--color-border)] my-6" />

        {/* ── 5) Dynamic Comments Count Header ──────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[var(--color-text-muted)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {totalCommentCount} {totalCommentCount === 1 ? "comment" : "comments"}
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            <Sparkles size={12} className="text-[#C07B5A]" />
            <span>Contextual Anonymity Active</span>
          </span>
        </div>

        {/* ── 6) Comments Stream with Instagram-Style Threading ─────────── */}
        <div className="flex flex-col gap-6 mb-8">
          {topLevelComments.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-muted)] bg-white rounded-2xl border border-[var(--color-border)] p-6">
              No comments yet. Share your thoughts anonymously below.
            </div>
          ) : (
            topLevelComments.map(comment => {
              const isLiked = likedCommentIds.has(comment.id);
              const replies = repliesByParentId[comment.id] || [];
              const hasReplies = replies.length > 0;
              const isThreadExpanded = !collapsedReplyThreads.has(comment.id);

              return (
                <div key={comment.id} className="flex flex-col animate-in fade-in duration-200">
                  {/* Main Top-Level Comment */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <AliasAvatar name={comment.alias.name} size={36} />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 leading-tight">
                          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {comment.alias.name}
                          </span>
                          <time className="text-[11px] text-[var(--color-text-muted)]">
                            {formatRelativeTime(comment.createdAt)}
                          </time>
                        </div>

                        {/* Comment Content */}
                        <p className="text-sm text-[var(--color-text-primary)] mt-1 leading-relaxed">
                          {comment.content}
                        </p>

                        {/* Actions Row: Reply Button */}
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            type="button"
                            onClick={() => handleInitiateReply(comment.id, comment.alias.name)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[#C07B5A] transition-colors cursor-pointer group"
                          >
                            <CornerDownRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Heart / Reaction Button */}
                    <button
                      onClick={() => handleToggleLike(comment.id)}
                      className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[#C07B5A] transition-colors cursor-pointer shrink-0 mt-0.5"
                      aria-label="Like comment"
                    >
                      <Heart
                        size={16}
                        strokeWidth={1.6}
                        className={isLiked ? "fill-[#C07B5A] text-[#C07B5A]" : "text-[var(--color-text-muted)] hover:text-[#C07B5A]"}
                      />
                    </button>
                  </div>

                  {/* ── Nested Instagram-Style Replies Thread ──────────────── */}
                  {hasReplies && (
                    <div className="ml-5 pl-4 border-l-2 border-[#E7DFD5] mt-3 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleThreadReplies(comment.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer self-start mb-0.5"
                      >
                        <div className="w-4 h-[1px] bg-[#C5BAA8]" />
                        <span>
                          {isThreadExpanded ? "Hide replies" : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                        </span>
                        {isThreadExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isThreadExpanded &&
                        replies.map(reply => {
                          const isReplyLiked = likedCommentIds.has(reply.id);

                          return (
                            <div
                              key={reply.id}
                              className="flex items-start justify-between gap-3 animate-in fade-in duration-150"
                            >
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <AliasAvatar name={reply.alias.name} size={30} />
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-2 leading-tight">
                                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                                      {reply.alias.name}
                                    </span>
                                    <time className="text-[10px] text-[var(--color-text-muted)]">
                                      {formatRelativeTime(reply.createdAt)}
                                    </time>
                                  </div>

                                  <p className="text-xs md:text-sm text-[var(--color-text-primary)] mt-1 leading-relaxed">
                                    {reply.replyToAlias && (
                                      <span className="font-semibold text-[#C07B5A] mr-1.5">
                                        @{reply.replyToAlias}
                                      </span>
                                    )}
                                    {reply.content}
                                  </p>

                                  <div className="flex items-center gap-3 mt-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleInitiateReply(comment.id, reply.alias.name)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-[#C07B5A] transition-colors cursor-pointer"
                                    >
                                      <CornerDownRight size={11} />
                                      <span>Reply</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleLike(reply.id)}
                                className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[#C07B5A] transition-colors cursor-pointer shrink-0 mt-0.5"
                                aria-label="Like reply"
                              >
                                <Heart
                                  size={14}
                                  strokeWidth={1.6}
                                  className={isReplyLiked ? "fill-[#C07B5A] text-[#C07B5A]" : "text-[var(--color-text-muted)]"}
                                />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── 7) Add Comment Input & Replying Context Panel ───────────────── */}
        <div className="sticky bottom-4 z-20 pt-2 pb-2 bg-[#FAF7F4] flex flex-col gap-2.5">

          {/* Commenting as / Alias Indicator & Shuffle */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <span>Commenting as</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[var(--color-border)] shadow-2xs">
                <AliasAvatar name={activeCommenterAlias} size={18} />
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {activeCommenterAlias}
                </span>
              </div>
              {!isAliasLocked ? (
                <button
                  type="button"
                  onClick={handleRerollCommentAlias}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#C07B5A] hover:underline cursor-pointer ml-1"
                  title="Shuffle alias"
                  aria-label="Shuffle alias"
                >
                  <RotateCw size={11} strokeWidth={2.2} />
                  <span>Shuffle</span>
                </button>
              ) : (
                <span className="text-[11px] text-[var(--color-text-muted)] italic">
                  {post?.isAuthor ? "(Author)" : "(locked for this thread)"}
                </span>
              )}
            </div>
          </div>

          {/* Replying Context Banner */}
          {replyingTo && (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F4EDE5] border border-[#E5DACD] animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center gap-2 text-xs">
                <CornerDownRight size={13} className="text-[#C07B5A]" />
                <span className="text-[var(--color-text-secondary)]">Replying to</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  @{replyingTo.aliasName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelReply}
                className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#EAE0D5] transition-colors cursor-pointer"
                title="Cancel reply"
                aria-label="Cancel reply"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Comment Input & Submit Button */}
          <form onSubmit={handleAddComment} className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                maxLength={2000}
                onChange={e => setCommentText(e.target.value)}
                placeholder={
                  replyingTo
                    ? `Reply to @${replyingTo.aliasName}...`
                    : "Add an anonymous comment..."
                }
                className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] shadow-xs transition-all focus:outline-none focus:border-[var(--color-border-strong)]"
              />
            </div>

            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              style={{
                backgroundColor: "#D48255",
              }}
              onMouseEnter={e => {
                if (commentText.trim() && !isSubmitting) e.currentTarget.style.backgroundColor = "#BF7147";
              }}
              onMouseLeave={e => {
                if (commentText.trim()) e.currentTarget.style.backgroundColor = "#D48255";
              }}
            >
              {isSubmitting ? "Sending..." : replyingTo ? "Reply" : "Comment"}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}

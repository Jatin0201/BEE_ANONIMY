import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MoreHorizontal,
  Heart,
  Share2,
  Flag,
  Check,
  MessageSquare,
  RotateCw,
  CornerDownRight,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ALL_CURATED_ALIASES } from '@/data/mockData';
import { usePostsStore } from '@/lib/posts-store';
import { formatRelativeTime } from '@/lib/utils';
import type { Comment } from '@/types';

// ─── Custom Alias Avatars ──────────────────────────────────────────────────

function AliasAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const normalized = name.toLowerCase();

  const badge = (
    <div
      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center shadow-xs"
      style={{ backgroundColor: '#D48255' }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#FAF7F4]" />
    </div>
  );

  if (normalized.includes('fox')) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#F4EFEA" />
          <path d="M10 13 L15 25 L20 28 L25 25 L30 13 L26 23 L20 29 L14 23 Z" fill="#D97746" />
          <polygon points="12,15 15,22 17,16" fill="#F8EDE3" />
          <polygon points="28,15 25,22 23,16" fill="#F8EDE3" />
          <path d="M15 25 L20 29 L17 29 Z" fill="#FFFFFF" />
          <path d="M25 25 L20 29 L23 29 Z" fill="#FFFFFF" />
          <circle cx="16" cy="22" r="1.5" fill="#2E241E" />
          <circle cx="24" cy="22" r="1.5" fill="#2E241E" />
          <circle cx="20" cy="27" r="1.2" fill="#2E241E" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes('raven') || normalized.includes('bird')) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EAEFF5" />
          <path
            d="M13 26 C13 20, 16 16, 21 14 C23 13, 27 12, 30 14 C31 14.5, 33 15, 35 15.5 C33 17, 30 18, 28 18 C28 22, 25 26, 20 28 C17 29, 14 28, 13 26 Z"
            fill="#1E293B"
          />
          <circle cx="25" cy="15.5" r="1" fill="#FFFFFF" />
          <path d="M18 22 C20 21, 23 21, 25 24" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes('oak') || normalized.includes('tree') || normalized.includes('wood')) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EDF3ED" />
          <rect x="18.5" y="24" width="3" height="6" rx="1" fill="#655243" />
          <path
            d="M20 10 C23 10, 26 12, 27 14 C29 15, 30 17, 29 20 C30 22, 28 25, 25 25 C24 25, 23 25, 22 24.5 C21 25, 19 25, 18 24.5 C17 25, 16 25, 15 25 C12 25, 10 22, 11 20 C10 17, 11 15, 13 14 C14 12, 17 10, 20 10 Z"
            fill="#4F6D55"
          />
          <circle cx="17" cy="15" r="1.5" fill="#6A8D71" opacity="0.6" />
          <circle cx="23" cy="16" r="1.8" fill="#6A8D71" opacity="0.6" />
          <circle cx="20" cy="20" r="1.6" fill="#6A8D71" opacity="0.6" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes('sun') || normalized.includes('amber') || normalized.includes('crane')) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#FEF6E9" />
          <circle cx="20" cy="20" r="7" fill="#E69C24" />
          <line x1="20" y1="9" x2="20" y2="11" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="29" x2="20" y2="31" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="20" x2="11" y2="20" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="20" x2="31" y2="20" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="14" y2="14" stroke="#E69C24" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="26" y1="26" x2="28" y2="28" stroke="#E69C24" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="18" cy="19" r="1" fill="#875306" />
          <circle cx="22" cy="19" r="1" fill="#875306" />
          <path d="M18.5 22 C19.2 23, 20.8 23, 21.5 22" stroke="#875306" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes('wolf') || normalized.includes('lynx')) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#ECEFF2" />
          <path d="M12 12 L16 24 L20 28 L24 24 L28 12 L24 21 L20 27 L16 21 Z" fill="#64748B" />
          <polygon points="14,14 16,20 18,15" fill="#CBD5E1" />
          <polygon points="26,14 24,20 22,15" fill="#CBD5E1" />
          <circle cx="17" cy="21" r="1.3" fill="#1E293B" />
          <circle cx="23" cy="21" r="1.3" fill="#1E293B" />
          <circle cx="20" cy="26" r="1.1" fill="#1E293B" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes('fern') || normalized.includes('birch') || normalized.includes('brook') || normalized.includes('mist')) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EBF4EE" />
          <path d="M20 30 C20 20, 22 14, 28 10 C24 14, 22 18, 20 30 Z" fill="#3B7A57" />
          <path d="M20 24 C16 22, 13 18, 12 14 C15 17, 18 20, 20 24 Z" fill="#5B9A77" />
          <path d="M20 18 C24 16, 27 12, 28 8 C25 11, 22 14, 20 18 Z" fill="#78B993" />
        </svg>
        {badge}
      </div>
    );
  }

  // Generic fallback
  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
        <circle cx="20" cy="20" r="20" fill="#F1ECE6" />
        <circle cx="20" cy="20" r="9" fill="#9C897B" />
        <path d="M16 16 L24 24 M24 16 L16 24" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {badge}
    </div>
  );
}

// ─── Post Detail Page Component ────────────────────────────────────────────

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const activePostId = postId || 'post-1';

  const { getPostById, getComments, addComment, getUserThreadAlias } = usePostsStore();

  const post = getPostById(activePostId);
  const comments = getComments(activePostId);

  // Replying state (Instagram-style)
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    aliasName: string;
  } | null>(null);

  const [commentText, setCommentText] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [collapsedReplyThreads, setCollapsedReplyThreads] = useState<Set<string>>(new Set());

  const commentInputRef = useRef<HTMLInputElement>(null);

  // 1) Identify all aliases already used in this thread (author + any commenters)
  const usedAliasesInThread = useMemo(() => {
    const set = new Set<string>();
    if (post?.alias?.name) {
      set.add(post.alias.name);
    }
    comments.forEach(c => {
      if (c.alias?.name) {
        set.add(c.alias.name);
      }
    });
    return set;
  }, [post, comments]);

  // 2) Filter available aliases: strictly unused in this thread
  const availableAliases = useMemo(() => {
    return ALL_CURATED_ALIASES.filter(alias => !usedAliasesInThread.has(alias));
  }, [usedAliasesInThread]);

  // 3) Check if user already locked an alias for this thread
  const lockedAlias = getUserThreadAlias(activePostId);
  const isAliasLocked = Boolean(lockedAlias);

  // 4) Active alias selection state for first-time commenter
  const [selectedAlias, setSelectedAlias] = useState<string>(() => {
    if (lockedAlias) return lockedAlias;
    return availableAliases[0] || ALL_CURATED_ALIASES[0];
  });

  // Ensure selected alias is valid if available pool shifts
  useEffect(() => {
    if (lockedAlias) {
      setSelectedAlias(lockedAlias);
    } else if (availableAliases.length > 0 && !availableAliases.includes(selectedAlias)) {
      setSelectedAlias(availableAliases[0]);
    }
  }, [availableAliases, lockedAlias, selectedAlias]);

  const activeCommenterAlias = isAliasLocked ? (lockedAlias || selectedAlias) : selectedAlias;

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(prev => (prev === message ? null : prev));
    }, 3000);
  };

  const handleRerollCommentAlias = () => {
    if (isAliasLocked || availableAliases.length === 0) return;
    const currentIndex = availableAliases.indexOf(selectedAlias);
    const nextIndex = (currentIndex + 1) % availableAliases.length;
    const nextAlias = availableAliases[nextIndex];
    setSelectedAlias(nextAlias);
    showToast(`Alias changed to ${nextAlias}`);
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;

    const trimmed = commentText.trim();

    addComment(post.id, {
      content: trimmed,
      aliasName: activeCommenterAlias,
      parentId: replyingTo?.commentId,
      replyToAlias: replyingTo?.aliasName,
    });

    const wasReplying = Boolean(replyingTo);
    const replyTarget = replyingTo?.aliasName;

    setCommentText('');
    setReplyingTo(null);

    if (wasReplying) {
      showToast(`Reply to @${replyTarget} posted as ${activeCommenterAlias}`);
    } else {
      showToast(`Comment posted as ${activeCommenterAlias}`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setIsMenuOpen(false);
    showToast('Post link copied to clipboard');
  };

  const handleReportPost = () => {
    setIsMenuOpen(false);
    showToast('Post reported to moderation team');
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

  // If post not found
  if (!post) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{
          backgroundColor: '#FAF7F4',
          fontFamily: 'var(--font-ui)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div className="w-12 h-12 rounded-full bg-[#EFEAE4] flex items-center justify-center mb-4 text-[var(--color-text-secondary)]">
          <MessageSquare size={22} />
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          Post not found
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mb-6 max-w-xs">
          The post you are looking for may have been removed or does not exist.
        </p>
        <Link
          to="/feed"
          className="px-5 py-2.5 rounded-full text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#2E2E2E] transition-colors"
          style={{ textDecoration: 'none' }}
        >
          Return to feed
        </Link>
      </div>
    );
  }

  // Dynamic comment count (all comments + replies)
  const totalCommentCount = comments.length;

  return (
    <div
      className="min-h-screen flex justify-center py-8 px-4 sm:px-6"
      style={{
        backgroundColor: '#FAF7F4',
        fontFamily: 'var(--font-ui)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* ── Toast Notification ────────────────────────────────────────── */}
      {notificationToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-sm shadow-md flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
            borderColor: '#333333',
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
            style={{ textDecoration: 'none' }}
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
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[var(--color-text-primary)]">
                  {post.alias.name}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EFEAE4] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  Author
                </span>
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
                <button
                  onClick={handleReportPost}
                  className="w-full px-3.5 py-2 text-left text-xs text-[#B94A48] hover:bg-[#FDF2F2] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Flag size={14} className="text-[#B94A48]" />
                  <span>Report post</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 3) Editorial Post Content ─────────────────────────────────── */}
        <div className="my-3">
          <h1
            className="text-2xl md:text-[26px] leading-[1.35] text-[var(--color-text-primary)] font-normal tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
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
              {totalCommentCount} {totalCommentCount === 1 ? 'comment' : 'comments'}
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            Contextual Anonymity Active
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
                        className={isLiked ? 'fill-[#C07B5A] text-[#C07B5A]' : 'text-[var(--color-text-muted)] hover:text-[#C07B5A]'}
                      />
                    </button>
                  </div>

                  {/* ── Nested Instagram-Style Replies Thread ──────────────── */}
                  {hasReplies && (
                    <div className="ml-5 pl-4 border-l-2 border-[#E7DFD5] mt-3 flex flex-col gap-3">
                      {/* Optional Expand/Collapse Header */}
                      <button
                        type="button"
                        onClick={() => handleToggleThreadReplies(comment.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer self-start mb-0.5"
                      >
                        <div className="w-4 h-[1px] bg-[#C5BAA8]" />
                        <span>
                          {isThreadExpanded ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
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
                                  className={isReplyLiked ? 'fill-[#C07B5A] text-[#C07B5A]' : 'text-[var(--color-text-muted)]'}
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

        {/* ── 7) Add Comment & Alias Selection Panel ─────────────────────── */}
        <div className="sticky bottom-4 z-20 pt-2 pb-2 bg-[#FAF7F4] flex flex-col gap-2.5">

          {/* ── Alias indicator & shuffle (original clean inline design) ── */}
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
                  (Locked for this thread)
                </span>
              )}
            </div>
          </div>

          {/* ── GOAL 3: Replying Context Banner ──────────────────────────── */}
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

          {/* ── Comment Input & Submit Button ────────────────────────────── */}
          <form onSubmit={handleAddComment} className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={
                  replyingTo
                    ? `Reply to @${replyingTo.aliasName}...`
                    : `Add a comment as ${activeCommenterAlias}...`
                }
                className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] shadow-xs transition-all focus:outline-none focus:border-[var(--color-border-strong)]"
              />
            </div>

            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              style={{
                backgroundColor: '#D48255',
              }}
              onMouseEnter={e => {
                if (commentText.trim()) e.currentTarget.style.backgroundColor = '#BF7147';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#D48255';
              }}
            >
              {replyingTo ? 'Reply' : 'Comment'}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}

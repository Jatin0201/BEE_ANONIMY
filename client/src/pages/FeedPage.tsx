import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Bell,
  User as UserIcon,
  Settings,
  Image as ImageIcon,
  Smile,
  Bookmark,
  MoreHorizontal,
  Search,
  X,
  Share2,
  Flag,
  Check,
  MessageSquare,
  RotateCw
} from 'lucide-react';
import { ALL_CURATED_ALIASES } from '@/data/mockData';
import { usePostsStore } from '@/lib/posts-store';
import { formatRelativeTime } from '@/lib/utils';
import { useSession } from '@/lib/auth-client';

// ─── Custom Alias Avatars ──────────────────────────────────────────────────
// Tailored SVGs matching the animal/botanical iconography in the reference

function AliasAvatar({ name, size = 42 }: { name: string; size?: number }) {
  const normalized = name.toLowerCase();

  // Small corner badge in warm copper/terracotta
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
      <div className="relative inline-block" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#F4EFEA" />
          {/* Fox head */}
          <path d="M10 13 L15 25 L20 28 L25 25 L30 13 L26 23 L20 29 L14 23 Z" fill="#D97746" />
          {/* Ears interior */}
          <polygon points="12,15 15,22 17,16" fill="#F8EDE3" />
          <polygon points="28,15 25,22 23,16" fill="#F8EDE3" />
          {/* White cheeks */}
          <path d="M15 25 L20 29 L17 29 Z" fill="#FFFFFF" />
          <path d="M25 25 L20 29 L23 29 Z" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="16" cy="22" r="1.5" fill="#2E241E" />
          <circle cx="24" cy="22" r="1.5" fill="#2E241E" />
          {/* Nose */}
          <circle cx="20" cy="27" r="1.2" fill="#2E241E" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes('raven') || normalized.includes('bird')) {
    return (
      <div className="relative inline-block" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EAEFF5" />
          {/* Raven silhouette */}
          <path
            d="M13 26 C13 20, 16 16, 21 14 C23 13, 27 12, 30 14 C31 14.5, 33 15, 35 15.5 C33 17, 30 18, 28 18 C28 22, 25 26, 20 28 C17 29, 14 28, 13 26 Z"
            fill="#1E293B"
          />
          {/* Eye */}
          <circle cx="25" cy="15.5" r="1" fill="#FFFFFF" />
          {/* Wing detail */}
          <path d="M18 22 C20 21, 23 21, 25 24" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes('oak') || normalized.includes('tree') || normalized.includes('wood')) {
    return (
      <div className="relative inline-block" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EDF3ED" />
          {/* Trunk */}
          <rect x="18.5" y="24" width="3" height="6" rx="1" fill="#655243" />
          {/* Oak Tree Canopy */}
          <path
            d="M20 10 C23 10, 26 12, 27 14 C29 15, 30 17, 29 20 C30 22, 28 25, 25 25 C24 25, 23 25, 22 24.5 C21 25, 19 25, 18 24.5 C17 25, 16 25, 15 25 C12 25, 10 22, 11 20 C10 17, 11 15, 13 14 C14 12, 17 10, 20 10 Z"
            fill="#4F6D55"
          />
          {/* Leaves highlights */}
          <circle cx="17" cy="15" r="1.5" fill="#6A8D71" opacity="0.6" />
          <circle cx="23" cy="16" r="1.8" fill="#6A8D71" opacity="0.6" />
          <circle cx="20" cy="20" r="1.6" fill="#6A8D71" opacity="0.6" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes('sun') || normalized.includes('amber')) {
    return (
      <div className="relative inline-block" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#FEF6E9" />
          {/* Sun center */}
          <circle cx="20" cy="20" r="7" fill="#E69C24" />
          {/* Rays */}
          <line x1="20" y1="9" x2="20" y2="11" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="29" x2="20" y2="31" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="20" x2="11" y2="20" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="20" x2="31" y2="20" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="14" y2="14" stroke="#E69C24" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="26" y1="26" x2="28" y2="28" stroke="#E69C24" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="28" y1="12" x2="26" y2="14" stroke="#E69C24" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="28" x2="14" y2="26" stroke="#E69C24" strokeWidth="1.8" strokeLinecap="round" />
          {/* Sun face */}
          <circle cx="18" cy="19" r="1" fill="#875306" />
          <circle cx="22" cy="19" r="1" fill="#875306" />
          <path d="M18.5 22 C19.2 23, 20.8 23, 21.5 22" stroke="#875306" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
        {badge}
      </div>
    );
  }

  // Fallback animal / nature avatar
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
        <circle cx="20" cy="20" r="20" fill="#F1ECE6" />
        {/* Soft geometric emblem */}
        <circle cx="20" cy="20" r="10" fill="#9C897B" />
        <path d="M16 16 L24 24 M24 16 L16 24" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {badge}
    </div>
  );
}

// User Profile Avatar (matching the reference footer "You" avatar)
function UserProfileAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative rounded-full overflow-hidden shrink-0"
      style={{ width: size, height: size, backgroundColor: '#E4DAC8', border: '1.5px solid #D6C8B2' }}
    >
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Curly hair outline */}
        <circle cx="18" cy="18" r="14" fill="#C5BAA8" />
        <path
          d="M10 16 C8 12, 12 8, 18 8 C24 8, 28 12, 26 16 C28 20, 24 24, 24 28 L12 28 C12 24, 8 20, 10 16 Z"
          fill="#4A3F35"
        />
        {/* Face */}
        <ellipse cx="18" cy="18" rx="6.5" ry="8" fill="#F2E6D5" />
        {/* Hair front locks */}
        <circle cx="14" cy="12" r="2.5" fill="#4A3F35" />
        <circle cx="18" cy="11" r="2.5" fill="#4A3F35" />
        <circle cx="22" cy="12" r="2.5" fill="#4A3F35" />
        {/* Eyes & Smile */}
        <circle cx="16" cy="17" r="1" fill="#4A3F35" />
        <circle cx="20" cy="17" r="1" fill="#4A3F35" />
        <path d="M16.5 21 C17.5 22, 18.5 22, 19.5 21" stroke="#4A3F35" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── Feed Page Component ───────────────────────────────────────────────────

export default function FeedPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const { posts, createPost } = usePostsStore();
  const [activeTab, setActiveTab] = useState<'latest' | 'top'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [composerAliasIndex, setComposerAliasIndex] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const currentComposerAlias = ALL_CURATED_ALIASES[composerAliasIndex % ALL_CURATED_ALIASES.length];

  const handleRerollComposerAlias = () => {
    setComposerAliasIndex(prev => prev + 1);
    const nextAlias = ALL_CURATED_ALIASES[(composerAliasIndex + 1) % ALL_CURATED_ALIASES.length];
    setNotificationToast(`Alias changed to ${nextAlias}`);
  };

  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const composerContainerRef = useRef<HTMLDivElement>(null);

  // Focus textarea when composer opens
  useEffect(() => {
    if (isComposerOpen) {
      setTimeout(() => {
        composerTextareaRef.current?.focus();
        composerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [isComposerOpen]);

  // Close card menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (openMenuPostId && !(e.target as HTMLElement).closest('.post-menu-container')) {
        setOpenMenuPostId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuPostId]);

  // Toast auto-dismiss
  useEffect(() => {
    if (notificationToast) {
      const timer = setTimeout(() => setNotificationToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notificationToast]);

  // Toggle composer from "+ Write something"
  const handleToggleComposer = () => {
    setIsComposerOpen(prev => !prev);
  };

  // Submit new post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = composerText.trim();
    if (!trimmed) return;

    createPost(trimmed, currentComposerAlias);
    setComposerText('');
    setComposerAliasIndex(prev => prev + 1);
    setIsComposerOpen(false);
    setNotificationToast(`Published anonymously as ${currentComposerAlias}!`);
  };

  // Toggle bookmark
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setNotificationToast('Removed from saved posts');
      } else {
        next.add(id);
        setNotificationToast('Post saved to bookmarks');
      }
      return next;
    });
  };

  // Copy link
  const handleCopyPostLink = (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setOpenMenuPostId(null);
    setNotificationToast('Post link copied to clipboard!');
  };

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.content.toLowerCase().includes(query) || p.alias.name.toLowerCase().includes(query)
      );
    }

    // Sort by tab
    if (activeTab === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'top') {
      result.sort((a, b) => b.commentCount - a.commentCount);
    }

    return result;
  }, [posts, searchQuery, activeTab]);

  // Determine user handle / email
  const sessionUser = session as { user?: { email?: string; name?: string } } | null | undefined;
  const userEmail = sessionUser?.user?.email || 'you@example.com';
  const userHandle = `@${userEmail.split('@')[0] || 'youraccount'}`;

  return (
    <div
      className="min-h-screen flex justify-center"
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

      {/* ── Main Container (Centered two-column layout) ────────────────── */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row px-4 md:px-8 py-6 gap-8 relative">

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
        <aside
          className="w-full md:w-64 shrink-0 flex flex-col justify-between md:sticky md:top-6 md:h-[calc(100vh-3rem)] pb-4 md:pb-6"
          aria-label="Sidebar navigation"
        >
          {/* Top section: Wordmark + Action Button + Navigation Items */}
          <div className="flex flex-col gap-6">
            {/* Wordmark */}
            <Link
              to="/feed"
              className="text-base font-semibold tracking-[0.22em] uppercase text-left select-none"
              style={{
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                letterSpacing: '0.22em',
              }}
            >
              ANONIMY
            </Link>

            {/* "+ Write something" CTA Button */}
            <button
              onClick={handleToggleComposer}
              className="w-full py-3 px-5 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
              style={{
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2E2E2E')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
              aria-label="Write a new anonymous post"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Write something</span>
            </button>

            {/* Navigation List */}
            <nav className="flex flex-col gap-1 mt-1">
              {/* Feed (Active State) */}
              <Link
                to="/feed"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#EFEAE4',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                }}
              >
                {/* Feed icon matching design reference: two stacked rounded rectangles / layers */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="7" x="3" y="3" rx="2" />
                  <rect width="18" height="7" x="3" y="14" rx="2" />
                </svg>
                <span>Feed</span>
              </Link>

              {/* Notifications */}
              <button
                onClick={() => setNotificationToast('No new notifications')}
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer text-left w-full"
              >
                <Bell size={18} strokeWidth={1.8} />
                <span>Notifications</span>
              </button>

              {/* Profile */}
              <Link
                to="/profile"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors text-left"
                style={{ textDecoration: 'none' }}
              >
                <UserIcon size={18} strokeWidth={1.8} />
                <span>Profile</span>
              </Link>

              {/* Settings */}
              <Link
                to="/settings"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors text-left"
                style={{ textDecoration: 'none' }}
              >
                <Settings size={18} strokeWidth={1.8} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Profile Section (No 3 dots menu as requested) */}
          <div className="pt-4 border-t border-[var(--color-border)] mt-6 md:mt-0">
            <Link
              to="/profile"
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F2ECE4] transition-colors text-left group"
              style={{ textDecoration: 'none' }}
            >
              <UserProfileAvatar size={36} />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold leading-tight text-[var(--color-text-primary)]">
                  You
                </span>
                <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[140px] leading-tight">
                  {userHandle}
                </span>
              </div>
            </Link>
          </div>
        </aside>

        {/* ── RIGHT / MAIN FEED COLUMN ──────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col max-w-2xl">

          {/* ── 1) Fixed / Sticky Search Bar on Top ───────────────────────── */}
          <div
            className="sticky top-0 z-20 pb-4 pt-1"
            style={{
              backgroundColor: '#FAF7F4',
            }}
          >
            <div className="relative flex items-center">
              <Search
                size={17}
                className="absolute left-4 text-[var(--color-text-muted)] pointer-events-none"
                strokeWidth={2}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search posts, topics, or aliases..."
                className="w-full pl-11 pr-10 py-2.5 rounded-xl text-sm bg-white border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] shadow-xs transition-all focus:outline-none focus:border-[var(--color-border-strong)] focus:ring-1 focus:ring-[var(--color-border-strong)]"
                aria-label="Search posts"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ── 2) "What's on your mind?" Composer Section ───────────────── */}
          {/* Appears below fixed search bar and above the feed when toggled */}
          {isComposerOpen && (
            <div
              ref={composerContainerRef}
              className="mb-6 animate-in fade-in slide-in-from-top-3 duration-200"
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
                  What's on your mind?
                </h2>
                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1 cursor-pointer p-1 rounded-md transition-colors"
                  aria-label="Close composer"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </div>

              <form
                onSubmit={handleCreatePost}
                className="bg-white rounded-2xl p-4 md:p-5 border border-[var(--color-border)] shadow-xs flex flex-col gap-3 transition-shadow focus-within:shadow-sm"
              >
                <textarea
                  ref={composerTextareaRef}
                  value={composerText}
                  onChange={e => setComposerText(e.target.value)}
                  placeholder="Share something anonymously..."
                  rows={3}
                  className="w-full text-[15px] leading-relaxed text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] resize-none border-none outline-none focus:ring-0 p-0 bg-transparent"
                  aria-label="Post content"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[var(--color-border)]/60 mt-1">
                  {/* Left: Attachment buttons + Alias preview badge */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNotificationToast('Image uploads are disabled in this MVP for privacy')}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                        title="Attach image (disabled for privacy)"
                        aria-label="Attach image"
                      >
                        <ImageIcon size={18} strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setComposerText(prev => prev + ' ✨')}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                        title="Add emoji"
                        aria-label="Add emoji"
                      >
                        <Smile size={18} strokeWidth={1.8} />
                      </button>
                    </div>

                    {/* Dynamic Alias Preview Pill with Reroll */}
                    <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-[#FAF7F4] border border-[var(--color-border)] shadow-2xs">
                      <AliasAvatar name={currentComposerAlias} size={20} />
                      <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                        {currentComposerAlias}
                      </span>
                      <button
                        type="button"
                        onClick={handleRerollComposerAlias}
                        className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-[#C07B5A] hover:bg-[#EFEAE4] transition-colors cursor-pointer"
                        title="Shuffle your anonymous alias"
                        aria-label="Shuffle alias"
                      >
                        <RotateCw size={12} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>

                  {/* Right: Post CTA button */}
                  <button
                    type="submit"
                    disabled={!composerText.trim()}
                    className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-[0.98]"
                    style={{
                      backgroundColor: '#C07B5A',
                    }}
                    onMouseEnter={e => {
                      if (composerText.trim()) e.currentTarget.style.backgroundColor = '#A8694B';
                    }}
                    onMouseLeave={e => {
                      if (composerText.trim()) e.currentTarget.style.backgroundColor = '#C07B5A';
                    }}
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── 3) Feed Tabs: Latest vs Top ──────────────────────────────── */}
          <div className="flex items-center gap-6 border-b border-[var(--color-border)] mb-5">
            <button
              onClick={() => setActiveTab('latest')}
              className={`pb-2.5 text-sm font-medium transition-all relative cursor-pointer ${
                activeTab === 'latest'
                  ? 'text-[var(--color-text-primary)] font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              Latest
              {activeTab === 'latest' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: 'var(--color-text-primary)' }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('top')}
              className={`pb-2.5 text-sm font-medium transition-all relative cursor-pointer ${
                activeTab === 'top'
                  ? 'text-[var(--color-text-primary)] font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              Top
              {activeTab === 'top' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: 'var(--color-text-primary)' }}
                />
              )}
            </button>
          </div>

          {/* ── 4) Feed Post List ────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {filteredAndSortedPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center my-6">
                <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  No posts found
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  {searchQuery ? `No posts matched "${searchQuery}"` : 'Be the first to share something anonymously.'}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#FAF7F4] text-[var(--color-text-secondary)] hover:bg-[#EFEAE4] border border-[var(--color-border)] transition-colors cursor-pointer"
                  >
                    Clear search
                  </button>
                ) : (
                  <button
                    onClick={() => setIsComposerOpen(true)}
                    className="text-xs px-4 py-2 rounded-full bg-[#1A1A1A] text-white hover:bg-[#2E2E2E] transition-colors cursor-pointer"
                  >
                    Write something
                  </button>
                )}
              </div>
            ) : (
              filteredAndSortedPosts.map(post => {
                const isSaved = bookmarkedIds.has(post.id);
                const isMenuOpen = openMenuPostId === post.id;

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl p-5 md:p-6 border border-[var(--color-border)] shadow-xs hover:border-[var(--color-border-strong)] transition-all duration-150 flex flex-col gap-3 group"
                  >
                    {/* Post Header: Alias Avatar + Name + Timestamp + Options */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AliasAvatar name={post.alias.name} size={38} />
                        <div className="flex flex-col leading-tight">
                          <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                            {post.alias.name}
                          </span>
                          <time className="text-xs text-[var(--color-text-muted)]">
                            {formatRelativeTime(post.createdAt)}
                          </time>
                        </div>
                      </div>

                      {/* 3 dots menu */}
                      <div className="relative post-menu-container">
                        <button
                          onClick={() => setOpenMenuPostId(isMenuOpen ? null : post.id)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#FAF7F4] transition-colors cursor-pointer"
                          aria-label="More options for post"
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {/* Options Dropdown */}
                        {isMenuOpen && (
                          <div
                            className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-md border border-[var(--color-border)] py-1.5 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              onClick={() => handleCopyPostLink(post.id)}
                              className="w-full px-3.5 py-2 text-left text-xs text-[var(--color-text-primary)] hover:bg-[#FAF7F4] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Share2 size={14} className="text-[var(--color-text-muted)]" />
                              <span>Copy link</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuPostId(null);
                                setNotificationToast('Post reported to moderation queue');
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs text-[#B94A48] hover:bg-[#FDF2F2] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Flag size={14} className="text-[#B94A48]" />
                              <span>Report post</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <p
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="text-[15px] leading-relaxed text-[var(--color-text-primary)] cursor-pointer select-text"
                    >
                      {post.content}
                    </p>

                    {/* Post Footer: Comment count + Bookmark */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/40 mt-1">
                      <Link
                        to={`/post/${post.id}`}
                        className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                        style={{ textDecoration: 'none' }}
                      >
                        <MessageSquare size={14} className="opacity-70" />
                        <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
                      </Link>

                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isSaved
                            ? 'text-[#C07B5A]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                        }`}
                        title={isSaved ? 'Remove bookmark' : 'Bookmark post'}
                        aria-label={isSaved ? 'Remove bookmark' : 'Bookmark post'}
                      >
                        <Bookmark
                          size={16}
                          fill={isSaved ? '#C07B5A' : 'none'}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

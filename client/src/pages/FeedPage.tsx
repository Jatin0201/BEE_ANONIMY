import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  AlertCircle,
  RefreshCw,
  Trash2,
  RotateCw,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { AliasAvatar } from "@/components/AliasAvatar";
import type { Post } from "@/types";

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

// User Profile Avatar (matching the reference footer "You" avatar)
function UserProfileAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative rounded-full overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: "#E4DAC8",
        border: "1.5px solid #D6C8B2",
      }}
    >
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="18" cy="18" r="14" fill="#C5BAA8" />
        <path
          d="M10 16 C8 12, 12 8, 18 8 C24 8, 28 12, 26 16 C28 20, 24 24, 24 28 L12 28 C12 24, 8 20, 10 16 Z"
          fill="#4A3F35"
        />
        <ellipse cx="18" cy="18" rx="6.5" ry="8" fill="#F2E6D5" />
        <circle cx="14" cy="12" r="2.5" fill="#4A3F35" />
        <circle cx="18" cy="11" r="2.5" fill="#4A3F35" />
        <circle cx="22" cy="12" r="2.5" fill="#4A3F35" />
        <circle cx="16" cy="17" r="1" fill="#4A3F35" />
        <circle cx="20" cy="17" r="1" fill="#4A3F35" />
        <path d="M16.5 21 C17.5 22, 18.5 22, 19.5 21" stroke="#4A3F35" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── Post Skeleton Loader ──────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-[var(--color-border)] shadow-xs flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EFEAE4]" />
          <div className="flex flex-col gap-1.5">
            <div className="w-24 h-3.5 bg-[#EFEAE4] rounded-md" />
            <div className="w-16 h-2.5 bg-[#F5EFEB] rounded-md" />
          </div>
        </div>
        <div className="w-6 h-6 rounded-md bg-[#F5EFEB]" />
      </div>
      <div className="flex flex-col gap-2 my-1">
        <div className="w-full h-4 bg-[#EFEAE4] rounded-md" />
        <div className="w-4/5 h-4 bg-[#EFEAE4] rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/40 mt-1">
        <div className="w-20 h-3 bg-[#F5EFEB] rounded-md" />
        <div className="w-4 h-4 bg-[#F5EFEB] rounded-md" />
      </div>
    </div>
  );
}

// ─── Feed Page Component ───────────────────────────────────────────────────

export default function FeedPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"latest" | "top">("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerAliasIndex, setComposerAliasIndex] = useState(() =>
    Math.floor(Math.random() * CURATED_ALIASES.length)
  );

  const currentComposerAlias =
    CURATED_ALIASES[composerAliasIndex % CURATED_ALIASES.length];

  const handleRerollComposerAlias = () => {
    setComposerAliasIndex(prev => prev + 1);
    const nextAlias =
      CURATED_ALIASES[(composerAliasIndex + 1) % CURATED_ALIASES.length];
    showToast(`Posting alias changed to ${nextAlias}`);
  };

  // Persist bookmarks in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("anonimy_bookmarks");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const composerContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [reloadToken, setReloadToken] = useState(0);

  // Fetch posts from Backend API
  useEffect(() => {
    let isMounted = true;

    async function loadFeed() {
      try {
        const res = await api.getPosts({
          sort: activeTab,
          search: debouncedSearch || undefined,
        });
        if (isMounted) {
          setPosts(res.posts);
          setErrorMessage(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("[feed] Failed to fetch posts:", err);
          setErrorMessage(
            err instanceof ApiError
              ? err.message
              : "Could not load posts. Please check your network connection."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFeed();

    return () => {
      isMounted = false;
    };
  }, [activeTab, debouncedSearch, reloadToken]);

  const handleRetry = () => {
    setIsLoading(true);
    setReloadToken(t => t + 1);
  };

  // Focus textarea when composer opens
  useEffect(() => {
    if (isComposerOpen) {
      setTimeout(() => {
        composerTextareaRef.current?.focus();
        composerContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [isComposerOpen]);

  // Close card menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (openMenuPostId && !(e.target as HTMLElement).closest(".post-menu-container")) {
        setOpenMenuPostId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuPostId]);

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

  // Toggle composer from "+ Write something"
  const handleToggleComposer = () => {
    setIsComposerOpen(prev => !prev);
  };

  // Submit new post to Backend API
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = composerText.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.createPost(trimmed, currentComposerAlias);
      const newPost = res.post;

      // Prepend newly created post to feed (ensuring isAuthor is marked)
      setPosts(prev => [{ ...newPost, isAuthor: true }, ...prev]);
      setComposerText("");
      setComposerAliasIndex(prev => prev + 1);
      setIsComposerOpen(false);
      showToast(`Published anonymously as ${newPost.alias.name}!`);
    } catch (err) {
      console.error("[feed] Error creating post:", err);
      showToast(
        err instanceof ApiError ? err.message : "Failed to publish post. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an author's post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post? This thread and its comments will be permanently removed.")) {
      return;
    }
    try {
      await api.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setOpenMenuPostId(null);
      showToast("Post deleted successfully");
    } catch (err) {
      console.error("[feed] Failed to delete post:", err);
      showToast(
        err instanceof ApiError ? err.message : "Failed to delete post. Please try again."
      );
    }
  };

  // Toggle bookmark with localStorage persistence
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from saved posts");
      } else {
        next.add(id);
        showToast("Post saved to bookmarks");
      }
      try {
        localStorage.setItem("anonimy_bookmarks", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Copy link
  const handleCopyPostLink = (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setOpenMenuPostId(null);
    showToast("Post link copied to clipboard!");
  };

  // Determine user handle / email
  const sessionUser = session as { user?: { email?: string; name?: string } } | null | undefined;
  const userEmail = sessionUser?.user?.email || "you@example.com";
  const userHandle = `@${userEmail.split("@")[0] || "youraccount"}`;

  return (
    <div
      className="min-h-screen flex justify-center"
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
                color: "var(--color-text-primary)",
                textDecoration: "none",
                letterSpacing: "0.22em",
              }}
            >
              ANONIMY
            </Link>

            {/* "+ Write something" CTA Button */}
            <button
              onClick={handleToggleComposer}
              className="w-full py-3 px-5 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
              style={{
                backgroundColor: "#1A1A1A",
                color: "#FFFFFF",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2E2E2E")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1A1A1A")}
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
                  backgroundColor: "#EFEAE4",
                  color: "var(--color-text-primary)",
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="7" x="3" y="3" rx="2" />
                  <rect width="18" height="7" x="3" y="14" rx="2" />
                </svg>
                <span>Feed</span>
              </Link>

              {/* Notifications */}
              <button
                onClick={() => showToast("No new notifications")}
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer text-left w-full"
              >
                <Bell size={18} strokeWidth={1.8} />
                <span>Notifications</span>
              </button>

              {/* Profile */}
              <Link
                to="/profile"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors text-left"
                style={{ textDecoration: "none" }}
              >
                <UserIcon size={18} strokeWidth={1.8} />
                <span>Profile</span>
              </Link>

              {/* Settings */}
              <Link
                to="/settings"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors text-left"
                style={{ textDecoration: "none" }}
              >
                <Settings size={18} strokeWidth={1.8} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Profile Section */}
          <div className="pt-4 border-t border-[var(--color-border)] mt-6 md:mt-0">
            <Link
              to="/profile"
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F2ECE4] transition-colors text-left group"
              style={{ textDecoration: "none" }}
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
              backgroundColor: "#FAF7F4",
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
                placeholder="Search posts or topics..."
                className="w-full pl-11 pr-10 py-2.5 rounded-xl text-sm bg-white border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] shadow-xs transition-all focus:outline-none focus:border-[var(--color-border-strong)] focus:ring-1 focus:ring-[var(--color-border-strong)]"
                aria-label="Search posts"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ── 2) "What's on your mind?" Composer Section ───────────────── */}
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
                  maxLength={2000}
                  className="w-full text-[15px] leading-relaxed text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] resize-none border-none outline-none focus:ring-0 p-0 bg-transparent"
                  aria-label="Post content"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[var(--color-border)]/60 mt-1">
                  {/* Left: Attachment buttons + Alias indicator */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => showToast("Image uploads are disabled in this MVP for privacy")}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                        title="Attach image (disabled for privacy)"
                        aria-label="Attach image"
                      >
                        <ImageIcon size={18} strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setComposerText(prev => prev + " ✨")}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                        title="Add emoji"
                        aria-label="Add emoji"
                      >
                        <Smile size={18} strokeWidth={1.8} />
                      </button>
                    </div>

                    {/* Interactive Alias Preview & Shuffle */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF7F4] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] shadow-2xs">
                      <AliasAvatar name={currentComposerAlias} size={18} />
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {currentComposerAlias}
                      </span>
                      <button
                        type="button"
                        onClick={handleRerollComposerAlias}
                        className="flex items-center gap-1 text-[11px] font-medium text-[#C07B5A] hover:underline cursor-pointer ml-1"
                        title="Shuffle alias"
                        aria-label="Shuffle alias"
                      >
                        <RotateCw size={11} strokeWidth={2.2} />
                        <span>Shuffle</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Post CTA button */}
                  <button
                    type="submit"
                    disabled={!composerText.trim() || isSubmitting}
                    className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-[0.98]"
                    style={{
                      backgroundColor: "#C07B5A",
                    }}
                    onMouseEnter={e => {
                      if (composerText.trim() && !isSubmitting) e.currentTarget.style.backgroundColor = "#A8694B";
                    }}
                    onMouseLeave={e => {
                      if (composerText.trim()) e.currentTarget.style.backgroundColor = "#C07B5A";
                    }}
                  >
                    {isSubmitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── 3) Feed Tabs: Latest vs Top ──────────────────────────────── */}
          <div className="flex items-center gap-6 border-b border-[var(--color-border)] mb-5">
            <button
              onClick={() => setActiveTab("latest")}
              className={`pb-2.5 text-sm font-medium transition-all relative cursor-pointer ${
                activeTab === "latest"
                  ? "text-[var(--color-text-primary)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              Latest
              {activeTab === "latest" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: "var(--color-text-primary)" }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("top")}
              className={`pb-2.5 text-sm font-medium transition-all relative cursor-pointer ${
                activeTab === "top"
                  ? "text-[var(--color-text-primary)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              Top
              {activeTab === "top" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: "var(--color-text-primary)" }}
                />
              )}
            </button>
          </div>

          {/* ── 4) Feed Post List & State Handlers ────────────────────────── */}
          {errorMessage && (
            <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-4 mb-4 flex items-center justify-between gap-3 text-sm text-[#C53030]">
              <div className="flex items-center gap-2">
                <AlertCircle size={17} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-[#FEB2B2] hover:bg-[#FED7D7] transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center my-6">
                <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  No posts found
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  {debouncedSearch
                    ? `No posts matched "${debouncedSearch}"`
                    : "Be the first to share something anonymously."}
                </p>
                {debouncedSearch ? (
                  <button
                    onClick={() => setSearchQuery("")}
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
              posts.map(post => {
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
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                              {post.alias.name}
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
                          <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-md border border-[var(--color-border)] py-1.5 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => handleCopyPostLink(post.id)}
                              className="w-full px-3.5 py-2 text-left text-xs text-[var(--color-text-primary)] hover:bg-[#FAF7F4] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Share2 size={14} className="text-[var(--color-text-muted)]" />
                              <span>Copy link</span>
                            </button>
                            {post.isAuthor ? (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full px-3.5 py-2 text-left text-xs text-[#B94A48] hover:bg-[#FDF2F2] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 size={14} className="text-[#B94A48]" />
                                <span>Delete post</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setOpenMenuPostId(null);
                                  showToast("Post reported to moderation queue");
                                }}
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
                        style={{ textDecoration: "none" }}
                      >
                        <MessageSquare size={14} className="opacity-70" />
                        <span>
                          {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                        </span>
                      </Link>

                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isSaved
                            ? "text-[#C07B5A]"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        }`}
                        title={isSaved ? "Remove bookmark" : "Bookmark post"}
                        aria-label={isSaved ? "Remove bookmark" : "Bookmark post"}
                      >
                        <Bookmark
                          size={16}
                          fill={isSaved ? "#C07B5A" : "none"}
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

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ChevronRight,
  Search,
  MessageSquare,
  Trash2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { api, ApiError } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { AliasAvatar } from '@/components/AliasAvatar';
import { SidebarNav, UserProfileAvatar } from '@/components/SidebarNav';
import type { Post } from '@/types';

// ─── Post Skeleton for Profile ──────────────────────────────────────────────
function MyPostSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-[var(--color-border)] shadow-xs flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EFEAE4]" />
          <div className="flex flex-col gap-1.5">
            <div className="w-24 h-3.5 bg-[#EFEAE4] rounded-md" />
            <div className="w-16 h-2.5 bg-[#F5EFEB] rounded-md" />
          </div>
        </div>
        <div className="w-6 h-6 rounded-md bg-[#F5EFEB]" />
      </div>
      <div className="flex flex-col gap-2 my-1">
        <div className="w-full h-4 bg-[#EFEAE4] rounded-md" />
        <div className="w-3/5 h-4 bg-[#EFEAE4] rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/40 mt-1">
        <div className="w-20 h-3 bg-[#F5EFEB] rounded-md" />
        <div className="w-16 h-3 bg-[#F5EFEB] rounded-md" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'posts' | 'account'>('posts');
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const sessionUser = session as { user?: { email?: string; name?: string; createdAt?: string } } | null | undefined;
  const userEmail = sessionUser?.user?.email || 'you@example.com';

  // Format creation date from active session or fallback dynamically to current month & year
  const memberSince = sessionUser?.user?.createdAt
    ? new Date(sessionUser.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Load user's authored posts
  useEffect(() => {
    let isMounted = true;

    async function loadMyPosts() {
      try {
        setIsLoadingPosts(true);
        const res = await api.getMyPosts();
        if (isMounted) {
          setMyPosts(res.posts);
          setPostsError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[profile] Failed to load my posts:', err);
          setPostsError(
            err instanceof ApiError
              ? err.message
              : 'Could not load your posts. Please check your connection.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingPosts(false);
        }
      }
    }

    void loadMyPosts();

    return () => {
      isMounted = false;
    };
  }, [reloadToken]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post? This thread and its comments will be permanently removed.")) {
      return;
    }

    try {
      setDeletingId(postId);
      await api.deletePost(postId);
      setMyPosts(prev => prev.filter(p => p.id !== postId));
      showToast('Post deleted successfully');
    } catch (err) {
      console.error('[profile] Failed to delete post:', err);
      showToast(err instanceof ApiError ? err.message : 'Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate('/login');
          },
        },
      });
    } catch {
      navigate('/login');
    }
  };

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
      {toastMessage && (
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
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Container ────────────────────────────────────────────── */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row px-4 md:px-8 py-6 gap-8 relative">

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
        <SidebarNav onShowToast={showToast} />

        {/* ── RIGHT / MAIN CONTENT COLUMN ───────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col max-w-2xl">
          {/* Top Quick Actions Bar */}
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-2">
              <h1
                className="text-2xl md:text-3xl font-normal text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Profile & Threads
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/feed" className="p-2 rounded-full hover:bg-[#EFEAE4] text-[var(--color-text-secondary)] transition-colors" title="Search Feed">
                <Search size={18} />
              </Link>
              <UserProfileAvatar size={32} />
            </div>
          </div>

          {/* ── Tabs Navigation ─────────────────────────────────────────── */}
          <div className="flex items-center gap-6 border-b border-[var(--color-border)] mb-6 text-sm">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3.5 font-medium relative transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'posts'
                  ? 'text-[var(--color-text-primary)] font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <span>Your Posts</span>
              {!isLoadingPosts && myPosts.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFEAE4] text-[#7A6B5D] font-medium">
                  {myPosts.length}
                </span>
              )}
              {activeTab === 'posts' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: 'var(--color-text-primary)' }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`pb-3.5 font-medium relative transition-colors cursor-pointer ${
                activeTab === 'account'
                  ? 'text-[var(--color-text-primary)] font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              Account & Privacy
              {activeTab === 'account' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: 'var(--color-text-primary)' }}
                />
              )}
            </button>
          </div>

          {/* ── TAB 1: YOUR POSTS SECTION ────────────────────────────────── */}
          {activeTab === 'posts' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              {postsError && (
                <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-4 flex items-center justify-between gap-3 text-sm text-[#C53030]">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={17} className="shrink-0" />
                    <span>{postsError}</span>
                  </div>
                  <button
                    onClick={() => setReloadToken(t => t + 1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-[#FEB2B2] hover:bg-[#FED7D7] transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw size={12} />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {isLoadingPosts ? (
                <>
                  <MyPostSkeleton />
                  <MyPostSkeleton />
                </>
              ) : myPosts.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center my-4">
                  <div className="w-12 h-12 rounded-full bg-[#EFEAE4] flex items-center justify-center mx-auto mb-3 text-[var(--color-text-secondary)]">
                    <Sparkles size={20} className="text-[#C07B5A]" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                    You haven't posted yet
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-5 max-w-sm mx-auto leading-relaxed">
                    All discussions and threads you start will be grouped here for easy replies and post management.
                  </p>
                  <Link
                    to="/feed"
                    className="inline-flex items-center gap-2 text-xs px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#2E2E2E] transition-colors font-medium shadow-xs"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>Write your first post</span>
                  </Link>
                </div>
              ) : (
                /* Post list */
                <div className="flex flex-col gap-4">
                  {myPosts.map(post => (
                    <article
                      key={post.id}
                      className="bg-white rounded-2xl p-5 md:p-6 border border-[var(--color-border)] shadow-xs hover:border-[var(--color-border-strong)] transition-all duration-150 flex flex-col gap-3 group"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AliasAvatar name={post.alias.name} size={38} />
                          <div className="flex flex-col leading-tight">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                                {post.alias.name}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#EFEAE4] text-[#7A6B5D] border border-[#DCD3C7]">
                                You
                              </span>
                            </div>
                            <time className="text-xs text-[var(--color-text-muted)] mt-0.5">
                              {formatRelativeTime(post.createdAt)}
                            </time>
                          </div>
                        </div>

                        {/* Direct Delete button */}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingId === post.id}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[#B94A48] hover:bg-[#FDF2F2] transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete post"
                          aria-label="Delete post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Post Content */}
                      <p
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="text-[15px] leading-relaxed text-[var(--color-text-primary)] cursor-pointer select-text hover:text-black transition-colors"
                      >
                        {post.content}
                      </p>

                      {/* Post Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]/40 mt-1 text-xs">
                        <Link
                          to={`/post/${post.id}`}
                          className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                          style={{ textDecoration: 'none' }}
                        >
                          <MessageSquare size={14} className="opacity-70" />
                          <span>
                            {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                          </span>
                        </Link>

                        <Link
                          to={`/post/${post.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#C07B5A] hover:text-[#A86445] transition-colors group-hover:underline"
                          style={{ textDecoration: 'none' }}
                        >
                          <span>Open thread</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: ACCOUNT & PRIVACY SECTION ────────────────────────── */}
          {activeTab === 'account' && (
            <div className="flex flex-col animate-in fade-in duration-150">
              {/* Account Section */}
              <div className="mb-8 pb-6 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Account</h2>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--color-text-muted)]">Email</span>
                    <span className="text-[var(--color-text-primary)]">{userEmail}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--color-text-muted)]">Member since</span>
                    <span className="text-[var(--color-text-primary)]">{memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Privacy Section */}
              <div className="mb-8 pb-6 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Privacy</h2>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-md">
                    Your identity changes between posts. Other users cannot see your account history or link your anonymous aliases across threads.
                  </p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-primary)] shrink-0">
                    <Shield size={22} strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="mb-10 pb-8 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Security</h2>
                <Link
                  to="/settings"
                  className="flex items-center justify-between py-2 text-sm text-[var(--color-text-primary)] hover:text-[#C07B5A] transition-colors"
                  style={{ textDecoration: 'none' }}
                >
                  <span>Change password</span>
                  <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
                </Link>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-150 cursor-pointer text-center"
                style={{
                  backgroundColor: '#F2E5DC',
                  color: '#C07B5A',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EADACF')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F2E5DC')}
              >
                Log out
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

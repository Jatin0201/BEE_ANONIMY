import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  User as UserIcon,
  Settings as SettingsIcon,
  Shield,
  ChevronRight,
  Search
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

function UserProfileAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative rounded-full overflow-hidden shrink-0"
      style={{ width: size, height: size, backgroundColor: '#E4DAC8', border: '1.5px solid #D6C8B2' }}
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const sessionUser = session as { user?: { email?: string; name?: string; createdAt?: string } } | null | undefined;
  const userEmail = sessionUser?.user?.email || 'you@example.com';
  const userHandle = `@${userEmail.split('@')[0] || 'youraccount'}`;

  // Format creation date or default
  const memberSince = sessionUser?.user?.createdAt
    ? new Date(sessionUser.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

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
      {/* ── Main Container ────────────────────────────────────────────── */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row px-4 md:px-8 py-6 gap-8 relative">

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
        <aside
          className="w-full md:w-64 shrink-0 flex flex-col justify-between md:sticky md:top-6 md:h-[calc(100vh-3rem)] pb-4 md:pb-6"
          aria-label="Sidebar navigation"
        >
          {/* Top section */}
          <div className="flex flex-col gap-6">
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

            {/* Navigation List matching 06_profile_page.png */}
            <nav className="flex flex-col gap-1 mt-2">
              {/* Feed */}
              <Link
                to="/feed"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors text-left"
                style={{ textDecoration: 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="7" x="3" y="3" rx="2" />
                  <rect width="18" height="7" x="3" y="14" rx="2" />
                </svg>
                <span>Feed</span>
              </Link>

              {/* Notifications */}
              <Link
                to="/settings"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors text-left"
                style={{ textDecoration: 'none' }}
              >
                <Bell size={18} strokeWidth={1.8} />
                <span>Notifications</span>
              </Link>

              {/* Profile (Active State) */}
              <Link
                to="/profile"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#EFEAE4',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                }}
              >
                <UserIcon size={18} strokeWidth={2} />
                <span>Profile</span>
              </Link>

              {/* Settings */}
              <Link
                to="/settings"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[#F2ECE4] hover:text-[var(--color-text-primary)] transition-colors text-left"
                style={{ textDecoration: 'none' }}
              >
                <SettingsIcon size={18} strokeWidth={1.8} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Profile Section */}
          <div className="pt-4 border-t border-[var(--color-border)] mt-6 md:mt-0">
            <div className="flex items-center justify-between p-1.5 rounded-xl">
              <div className="flex items-center gap-3">
                <UserProfileAvatar size={36} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold leading-tight text-[var(--color-text-primary)]">
                    You
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[140px] leading-tight">
                    {userHandle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT / MAIN ACCOUNT COLUMN ───────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col max-w-xl">
          {/* Top Icons matching reference */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Link to="/feed" className="p-2 rounded-full hover:bg-[#EFEAE4] text-[var(--color-text-secondary)] transition-colors">
              <Search size={18} />
            </Link>
            <Link to="/settings" className="p-2 rounded-full hover:bg-[#EFEAE4] text-[var(--color-text-secondary)] transition-colors">
              <Bell size={18} />
            </Link>
            <UserProfileAvatar size={32} />
          </div>

          {/* Header Title */}
          <div className="pb-4 border-b border-[var(--color-border)] mb-8">
            <h1
              className="text-2xl md:text-3xl font-normal text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Your account
            </h1>
          </div>

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
                Your identity changes between posts. Other users cannot see your account history.
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

          {/* Logout Button matching 06_profile_page.png */}
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
        </main>
      </div>
    </div>
  );
}

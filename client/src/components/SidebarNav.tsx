import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  Bell,
  User as UserIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';

export function UserProfileAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative rounded-full overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: '#E4DAC8',
        border: '1.5px solid #D6C8B2',
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

interface SidebarNavProps {
  onOpenComposer?: () => void;
  onShowToast?: (msg: string) => void;
}

export function SidebarNav({ onOpenComposer, onShowToast }: SidebarNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();

  const pathname = location.pathname;
  const isFeedActive = pathname === '/feed' || pathname.startsWith('/post/');
  const isProfileActive = pathname === '/profile';
  const isSettingsActive = pathname === '/settings';

  const sessionUser = session as { user?: { email?: string; name?: string } } | null | undefined;
  const userEmail = sessionUser?.user?.email || 'you@example.com';
  const userHandle = `@${userEmail.split('@')[0] || 'youraccount'}`;

  const handleWriteClick = () => {
    if (onOpenComposer) {
      onOpenComposer();
    } else {
      navigate('/feed');
    }
  };

  const handleNotificationClick = () => {
    if (onShowToast) {
      onShowToast('No new notifications');
    }
  };

  return (
    <aside
      className="w-full md:w-64 shrink-0 flex flex-col justify-between md:sticky md:top-6 md:h-[calc(100vh-3rem)] pb-4 md:pb-6 select-none"
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
          onClick={handleWriteClick}
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
          {/* Feed */}
          <Link
            to="/feed"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm transition-all duration-150 text-left cursor-pointer ${
              isFeedActive
                ? 'font-medium bg-[var(--color-nav-active)] text-[var(--color-text-primary)]'
                : 'font-normal text-[var(--color-text-secondary)] hover:bg-[var(--color-nav-hover)] hover:text-[var(--color-text-primary)]'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={isFeedActive ? '2' : '1.8'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="7" x="3" y="3" rx="2" />
              <rect width="18" height="7" x="3" y="14" rx="2" />
            </svg>
            <span>Feed</span>
          </Link>

          {/* Notifications */}
          <button
            onClick={handleNotificationClick}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-normal text-[var(--color-text-secondary)] hover:bg-[var(--color-nav-hover)] hover:text-[var(--color-text-primary)] transition-all duration-150 cursor-pointer text-left w-full"
          >
            <Bell size={18} strokeWidth={1.8} />
            <span>Notifications</span>
          </button>

          {/* Profile */}
          <Link
            to="/profile"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm transition-all duration-150 text-left cursor-pointer ${
              isProfileActive
                ? 'font-medium bg-[var(--color-nav-active)] text-[var(--color-text-primary)]'
                : 'font-normal text-[var(--color-text-secondary)] hover:bg-[var(--color-nav-hover)] hover:text-[var(--color-text-primary)]'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <UserIcon size={18} strokeWidth={isProfileActive ? 2 : 1.8} />
            <span>Profile</span>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm transition-all duration-150 text-left cursor-pointer ${
              isSettingsActive
                ? 'font-medium bg-[var(--color-nav-active)] text-[var(--color-text-primary)]'
                : 'font-normal text-[var(--color-text-secondary)] hover:bg-[var(--color-nav-hover)] hover:text-[var(--color-text-primary)]'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <SettingsIcon size={18} strokeWidth={isSettingsActive ? 2 : 1.8} />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Profile Section */}
      <div className="pt-4 border-t border-[var(--color-border)] mt-6 md:mt-0">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[var(--color-nav-hover)] transition-colors text-left group"
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
  );
}

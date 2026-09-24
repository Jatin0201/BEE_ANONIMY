import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Bell,
  User as UserIcon,
  Settings as SettingsIcon,
  Shield,
  KeyRound,
  Mail,
  Smartphone,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop,
  Check,
  X,
  AlertTriangle,
  LogOut,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

// ─── Shared Alias Avatars for Privacy Demo ─────────────────────────────────

function AliasAvatarMini({ name, size = 32 }: { name: string; size?: number }) {
  const normalized = name.toLowerCase();

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
      </div>
    );
  }

  if (normalized.includes('raven')) {
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
      </div>
    );
  }

  if (normalized.includes('oak')) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EDF3ED" />
          <rect x="18.5" y="24" width="3" height="6" rx="1" fill="#655243" />
          <path
            d="M20 10 C23 10, 26 12, 27 14 C29 15, 30 17, 29 20 C30 22, 28 25, 25 25 C24 25, 23 25, 22 24.5 C21 25, 19 25, 18 24.5 C17 25, 16 25, 15 25 C12 25, 10 22, 11 20 C10 17, 11 15, 13 14 C14 12, 17 10, 20 10 Z"
            fill="#4F6D55"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
        <circle cx="20" cy="20" r="20" fill="#FEF6E9" />
        <circle cx="20" cy="20" r="7" fill="#E69C24" />
        <circle cx="18" cy="19" r="1" fill="#875306" />
        <circle cx="22" cy="19" r="1" fill="#875306" />
        <path d="M18.5 22 C19.2 23, 20.8 23, 21.5 22" stroke="#875306" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// User Profile Avatar matching design
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

// ─── Settings Page Component ───────────────────────────────────────────────

type SettingsSection = 'account' | 'privacy' | 'appearance' | 'notifications' | 'about';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  // Active section tab
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  // Notification Toast state
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(prev => (prev === message ? null : prev));
    }, 3200);
  };

  // ── Modals State ──────────────────────────────────────────────────────────
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<'privacy' | 'terms' | null>(null);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Preferences states
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  const [fontSizePref, setFontSizePref] = useState<'compact' | 'standard' | 'relaxed'>('standard');

  const [notifyPostReplies, setNotifyPostReplies] = useState(true);
  const [notifyThreadActivity, setNotifyThreadActivity] = useState(true);
  const [notifyCommunityDigest, setNotifyCommunityDigest] = useState(false);

  // Determine user info
  const sessionUser = session as { user?: { email?: string; name?: string; createdAt?: string } } | null | undefined;
  const userEmail = sessionUser?.user?.email || 'you@example.com';
  const userHandle = `@${userEmail.split('@')[0] || 'youraccount'}`;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    // Simulate API call
    setTimeout(() => {
      setIsSavingPassword(false);
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!');
    }, 700);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!newEmail || !newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!emailConfirmPassword) {
      setEmailError('Please enter your password to confirm email change.');
      return;
    }

    setIsSavingEmail(true);
    // Simulate API call
    setTimeout(() => {
      setIsSavingEmail(false);
      setIsEmailModalOpen(false);
      setNewEmail('');
      setEmailConfirmPassword('');
      showToast(`Verification sent to ${newEmail}`);
    }, 700);
  };

  const handleExportData = () => {
    const exportPayload = {
      user: {
        email: userEmail,
        exportDate: new Date().toISOString(),
        anonymityModel: 'contextual-deterministic',
      },
      privacyNote:
        'Anonimy stores minimal personal metadata. Posts and comments are indexed by randomized contextual aliases to preserve privacy.',
      preferences: {
        theme: themeMode,
        fontSize: fontSizePref,
        notifications: {
          postReplies: notifyPostReplies,
          threadActivity: notifyThreadActivity,
          communityDigest: notifyCommunityDigest,
        },
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anonimy-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Account data archive downloaded');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      return;
    }

    setIsDeletingAccount(true);
    setTimeout(async () => {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
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
    }, 800);
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

  const handleSignOutOtherSessions = () => {
    showToast('Signed out of all other devices and sessions.');
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
            <Link
              to="/feed"
              className="w-full py-3 px-5 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
              style={{
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2E2E2E')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
              aria-label="Write a new anonymous post"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Write something</span>
            </Link>

            {/* Navigation List */}
            <nav className="flex flex-col gap-1 mt-1">
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
              <button
                onClick={() => showToast('No new notifications')}
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

              {/* Settings (Active State) */}
              <Link
                to="/settings"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#EFEAE4',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                }}
              >
                <SettingsIcon size={18} strokeWidth={2} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Profile Section */}
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

        {/* ── RIGHT / MAIN SETTINGS COLUMN ───────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col max-w-2xl pb-16">

          {/* Page Title & Header */}
          <div className="pb-6 border-b border-[var(--color-border)] mb-6">
            <h1
              className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Settings
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
              Manage your private credentials, privacy assurances, and application preferences.
            </p>
          </div>

          {/* Horizontal Section Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-[var(--color-border)] no-scrollbar">
            {[
              { id: 'account', label: 'Account & Security' },
              { id: 'privacy', label: 'Privacy & Anonymity' },
              { id: 'appearance', label: 'Appearance' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'about', label: 'About' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as SettingsSection)}
                className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:bg-[#EFEAE4] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── SECTION 1: ACCOUNT & SECURITY ────────────────────────────── */}
          {activeSection === 'account' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              {/* Account Information Card */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FAF7F4] flex items-center justify-center border border-[var(--color-border)]">
                      <Mail size={16} className="text-[#C07B5A]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Account Email</h2>
                      <p className="text-xs text-[var(--color-text-muted)]">Your private login and recovery address</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="text-xs font-medium text-[#C07B5A] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F4] border border-[var(--color-border)]">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{userEmail}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EDF3ED] text-[#4F6D55] border border-[#D5E2D5]">
                    Verified
                  </span>
                </div>
              </div>

              {/* Password & Authentication */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FAF7F4] flex items-center justify-center border border-[var(--color-border)]">
                      <KeyRound size={16} className="text-[#C07B5A]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Password</h2>
                      <p className="text-xs text-[var(--color-text-muted)]">Keep your private account protected</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#FAF7F4] hover:bg-[#EFEAE4] border border-[var(--color-border)] text-[var(--color-text-primary)] transition-colors cursor-pointer"
                  >
                    Change password
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FAF7F4] flex items-center justify-center border border-[var(--color-border)]">
                      <Smartphone size={16} className="text-[#C07B5A]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Active Sessions</h2>
                      <p className="text-xs text-[var(--color-text-muted)]">Where you are currently logged in</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOutOtherSessions}
                    className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline cursor-pointer"
                  >
                    Sign out other sessions
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F4] border border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <Laptop size={17} className="text-[var(--color-text-secondary)]" />
                      <div>
                        <div className="text-xs font-medium text-[var(--color-text-primary)]">
                          Current Web Browser
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">
                          Active now • IP Address protected
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EFEAE4] text-[var(--color-text-secondary)]">
                      This Device
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Log out & Delete */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[#E8DCD5] shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Session Management</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">Log out of your current session on this device</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-[#C07B5A] bg-[#F2E5DC] hover:bg-[#EBD8CD] transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Log out</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[#B33A3A]">Delete Account</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Permanently delete your credentials and unlink all session records
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#B33A3A] hover:bg-[#FDF2F2] border border-[#F4D1D1] transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 2: PRIVACY & ANONYMITY ───────────────────────────── */}
          {activeSection === 'privacy' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              {/* Core Philosophy Banner */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#FAF7F4] flex items-center justify-center border border-[var(--color-border)] shrink-0">
                    <Shield size={18} className="text-[#C07B5A]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                      Contextual Anonymity Model
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                      Unlike traditional social networks, Anonimy gives you a <strong>unique deterministic alias per post</strong>.
                      Your identity changes across threads, preventing cross-post tracking.
                    </p>
                  </div>
                </div>

                {/* Visual Alias Examples */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <div className="p-3 rounded-xl bg-[#FAF7F4] border border-[var(--color-border)] flex items-center gap-3">
                    <AliasAvatarMini name="Silent Fox" size={32} />
                    <div>
                      <div className="text-xs font-semibold text-[var(--color-text-primary)]">Thread #1</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">You appear as: Silent Fox</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F4] border border-[var(--color-border)] flex items-center gap-3">
                    <AliasAvatarMini name="Blue Raven" size={32} />
                    <div>
                      <div className="text-xs font-semibold text-[var(--color-text-primary)]">Thread #2</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">You appear as: Blue Raven</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees List */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                  Our Privacy Guarantees
                </h2>

                <div className="flex flex-col gap-3">
                  {[
                    {
                      title: 'No Public History',
                      desc: 'Other users cannot visit your profile or see a list of posts you created or commented on.',
                    },
                    {
                      title: 'Zero Searchable Handles',
                      desc: 'Your real account email and identifier are strictly isolated on the secure server.',
                    },
                    {
                      title: 'No Algorithmic Tracking',
                      desc: 'The global feed is chronological and unbiased, with zero behavioral surveillance.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#EDF3ED] text-[#4F6D55] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--color-text-primary)]">{item.title}</div>
                        <div className="text-xs text-[var(--color-text-secondary)] leading-normal">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Your Data */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Download Your Data</h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Export a portable JSON archive of your personal preferences and metadata.
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-[#FAF7F4] hover:bg-[#EFEAE4] border border-[var(--color-border)] text-[var(--color-text-primary)] transition-colors cursor-pointer shrink-0"
                >
                  <Download size={14} />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* ── SECTION 3: APPEARANCE ────────────────────────────────────── */}
          {activeSection === 'appearance' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              {/* Theme Selector */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Theme</h2>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Select your visual environment for reading and writing
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Warm Light', desc: 'Cream & warm tones', icon: Sun, color: '#FAF7F4' },
                    { id: 'dark', label: 'Earthy Dark', desc: 'Muted slate & espresso', icon: Moon, color: '#24211E' },
                    { id: 'system', label: 'System', desc: 'Matches device', icon: Laptop, color: '#EFEAE4' },
                  ].map(t => {
                    const Icon = t.icon;
                    const isSelected = themeMode === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setThemeMode(t.id as 'light' | 'dark' | 'system');
                          showToast(`Theme updated to ${t.label}`);
                        }}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A] bg-[#FAF7F4]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: t.id === 'dark' ? '#2E2B27' : '#EFEAE4' }}
                          >
                            <Icon
                              size={15}
                              className={t.id === 'dark' ? 'text-amber-200' : 'text-[var(--color-text-primary)]'}
                            />
                          </div>
                          {isSelected && <Check size={15} className="text-[#C07B5A]" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[var(--color-text-primary)]">{t.label}</div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">{t.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Preference */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Reading Text Size</h2>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Adjust text scaling for comfortable long-form reading
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'compact', label: 'Compact', size: '14px' },
                    { id: 'standard', label: 'Standard', size: '15px' },
                    { id: 'relaxed', label: 'Relaxed', size: '16px' },
                  ].map(f => {
                    const isSelected = fontSizePref === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFontSizePref(f.id as 'compact' | 'standard' | 'relaxed');
                          showToast(`Font scaling set to ${f.label}`);
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A] bg-[#FAF7F4]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-white'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[var(--color-text-primary)]">{f.label}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">{f.size}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 4: NOTIFICATIONS ─────────────────────────────────── */}
          {activeSection === 'notifications' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Email Preferences</h2>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Anonimy sends notifications solely for genuine conversations. No marketing spam.
                </p>

                <div className="flex flex-col gap-4">
                  {[
                    {
                      label: 'Replies to your posts',
                      desc: 'Receive an email notification when someone comments on a post you initiated.',
                      value: notifyPostReplies,
                      setter: setNotifyPostReplies,
                    },
                    {
                      label: 'Thread discussions',
                      desc: 'Receive updates when someone responds in a thread you contributed to.',
                      value: notifyThreadActivity,
                      setter: setNotifyThreadActivity,
                    },
                    {
                      label: 'Community letters',
                      desc: 'Receive occasional thoughtful reflections and product milestone updates.',
                      value: notifyCommunityDigest,
                      setter: setNotifyCommunityDigest,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pt-3 pb-2 border-t border-[var(--color-border)] first:border-0 first:pt-0"
                    >
                      <div className="max-w-[80%]">
                        <div className="text-xs font-semibold text-[var(--color-text-primary)]">{item.label}</div>
                        <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.value}
                        onClick={() => {
                          item.setter(!item.value);
                          showToast('Notification preference saved');
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                          item.value ? 'bg-[#1A1A1A]' : 'bg-[#D0C9C1]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                            item.value ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 5: ABOUT ─────────────────────────────────────────── */}
          {activeSection === 'about' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              {/* Product Info */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F4] flex items-center justify-center border border-[var(--color-border)]">
                    <BookOpen size={16} className="text-[#C07B5A]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">About Anonimy</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">Version 0.1.0 • Privacy by Design</p>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  Anonimy is designed to be a calm, human space for open thoughts, confessions, advice, and observations.
                  We reject clout chasing, follower metrics, and permanent social burdens.
                </p>

                <div className="flex flex-col gap-2 pt-3 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => setIsLegalModalOpen('privacy')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF7F4] text-xs font-medium text-[var(--color-text-primary)] transition-colors cursor-pointer text-left"
                  >
                    <span>Privacy Policy</span>
                    <ChevronRight size={15} className="text-[var(--color-text-muted)]" />
                  </button>

                  <button
                    onClick={() => setIsLegalModalOpen('terms')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF7F4] text-xs font-medium text-[var(--color-text-primary)] transition-colors cursor-pointer text-left"
                  >
                    <span>Terms of Service & Community Code</span>
                    <ChevronRight size={15} className="text-[var(--color-text-muted)]" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── MODAL: CHANGE PASSWORD ────────────────────────────────────── */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Update Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#FAF7F4]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              {passwordError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-strong)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  New Password (min. 8 characters)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-strong)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-strong)]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[#FAF7F4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#2E2E2E] transition-colors cursor-pointer"
                >
                  {isSavingPassword ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHANGE EMAIL ───────────────────────────────────────── */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Update Account Email</h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#FAF7F4]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              {emailError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="newemail@example.com"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-strong)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Confirm with Password
                </label>
                <input
                  type="password"
                  value={emailConfirmPassword}
                  onChange={e => setEmailConfirmPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-strong)]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[#FAF7F4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#2E2E2E] transition-colors cursor-pointer"
                >
                  {isSavingEmail ? 'Sending verification...' : 'Update Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE ACCOUNT CONFIRMATION ─────────────────────────── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-[var(--color-border)]">
            <div className="flex items-center gap-3 text-[#B33A3A] mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Delete Account</h3>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              This action is permanent. All your private login credentials will be removed.
              To confirm deletion, please type <strong className="text-[var(--color-text-primary)]">DELETE</strong> below:
            </p>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={e => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-[var(--color-border)] focus:outline-none focus:border-red-400 mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2 rounded-full text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[#FAF7F4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE' || isDeletingAccount}
                className="px-4 py-2 rounded-full text-xs font-medium bg-[#B33A3A] text-white hover:bg-[#962F2F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isDeletingAccount ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PRIVACY / TERMS READER ────────────────────────────── */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-[var(--color-border)] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {isLegalModalOpen === 'privacy' ? 'Privacy Policy' : 'Terms & Community Code'}
              </h3>
              <button
                onClick={() => setIsLegalModalOpen(null)}
                className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#FAF7F4]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto text-xs text-[var(--color-text-secondary)] leading-relaxed flex flex-col gap-3 pr-1">
              {isLegalModalOpen === 'privacy' ? (
                <>
                  <p>
                    <strong>1. Core Privacy Principle</strong>: Anonimy is built with privacy as the default foundation. We do not sell your personal information or track your browsing activity across other services.
                  </p>
                  <p>
                    <strong>2. Contextual Anonymity</strong>: When you post or comment, an alias is generated dynamically for that specific post. Your real email and account credentials are kept strictly private on our secure server.
                  </p>
                  <p>
                    <strong>3. Data Retention</strong>: You can export your metadata or delete your account at any time from these settings.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Calm & Supportive Environment</strong>: Anonimy is a space for honest human expression. Harassment, doxxing, hate speech, and illegal activities are strictly prohibited.
                  </p>
                  <p>
                    <strong>2. Respecting Anonymity</strong>: Attempting to deanonymize, unmask, or trace participants across threads violates community rules.
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--color-border)] flex justify-end">
              <button
                onClick={() => setIsLegalModalOpen(null)}
                className="px-4 py-2 rounded-full text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#2E2E2E] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

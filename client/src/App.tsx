import { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import FeedPage from '@/pages/FeedPage';
import PostDetailPage from '@/pages/PostDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import { useSession } from '@/lib/auth-client';

function AppRoutes() {
  const { data: session, isPending } = useSession();
  const [hasResolvedInitialAuth, setHasResolvedInitialAuth] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setHasResolvedInitialAuth(true);
    }
  }, [isPending]);

  // Only display full-page loading placeholder on the very first initial session check
  if (!hasResolvedInitialAuth && isPending) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)', fontFamily: 'var(--font-ui)' }}
      >
        <div className="text-sm tracking-wide text-[var(--color-text-muted)] animate-pulse">
          Loading Anonimy...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing — redirect logged-in users to /feed */}
      <Route
        path="/"
        element={session ? <Navigate to="/feed" replace /> : <LandingPage />}
      />

      {/* Auth routes — redirect already-authenticated users to /feed */}
      <Route
        path="/login"
        element={session ? <Navigate to="/feed" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={session ? <Navigate to="/feed" replace /> : <SignupPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes — redirect unauthenticated users to /login */}
      <Route
        path="/feed"
        element={!session ? <Navigate to="/login" replace /> : <FeedPage />}
      />
      <Route
        path="/post/:postId"
        element={!session ? <Navigate to="/login" replace /> : <PostDetailPage />}
      />
      <Route
        path="/profile"
        element={!session ? <Navigate to="/login" replace /> : <ProfilePage />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
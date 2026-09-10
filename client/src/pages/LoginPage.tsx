import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { validateEmail } from '@/lib/email-validator';

// ─── Decorative botanical sprig SVG ──────────────────────────────────────
function BotanicalSprig() {
  return (
    <svg
      viewBox="0 0 120 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Main stem */}
      <path
        d="M60 175 C58 140, 54 110, 50 80 C46 52, 42 28, 48 10"
        stroke="#3D4A35" strokeWidth="1.2" strokeLinecap="round" fill="none"
      />
      {/* Branch left 1 */}
      <path d="M54 120 C42 112, 28 106, 18 96" stroke="#3D4A35" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Branch right 1 */}
      <path d="M52 100 C62 90, 74 84, 82 74" stroke="#3D4A35" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Branch left 2 */}
      <path d="M50 76 C38 70, 26 62, 16 50" stroke="#3D4A35" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Branch right 2 */}
      <path d="M49 58 C58 48, 68 40, 74 28" stroke="#3D4A35" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Tip buds */}
      <circle cx="18" cy="96" r="2.5" fill="#3D4A35" opacity="0.7" />
      <circle cx="82" cy="74" r="2" fill="#3D4A35" opacity="0.7" />
      <circle cx="16" cy="50" r="2.5" fill="#3D4A35" opacity="0.6" />
      <circle cx="74" cy="28" r="2" fill="#3D4A35" opacity="0.6" />
      <circle cx="48" cy="10" r="2.5" fill="#3D4A35" opacity="0.65" />
      {/* Small seed dots */}
      <circle cx="36" cy="108" r="1.2" fill="#3D4A35" opacity="0.5" />
      <circle cx="68" cy="82" r="1" fill="#3D4A35" opacity="0.45" />
      <circle cx="30" cy="64" r="1.2" fill="#3D4A35" opacity="0.4" />
      <circle cx="60" cy="42" r="1" fill="#3D4A35" opacity="0.45" />
    </svg>
  );
}

// ─── Left panel decorative blobs ─────────────────────────────────────────
function PanelBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 overflow-hidden">
      {/* Large sage oval — lower-center */}
      <div className="absolute" style={{ bottom: '60px', left: '18px', width: '220px', height: '260px' }}>
        <svg viewBox="0 0 220 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M110 14 C152 -6, 210 20, 218 80 C226 138, 196 206, 148 240
               C102 272, 44 264, 14 214 C-14 164, 4 88, 44 48 C68 24, 84 32, 110 14 Z"
            fill="#B8C3AE" fillOpacity="0.58"
          />
        </svg>
      </div>

      {/* Medium sand/cream oval — overlapping bottom-right of sage */}
      <div className="absolute" style={{ bottom: '30px', left: '80px', width: '160px', height: '190px' }}>
        <svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M82 10 C118 -4, 158 28, 156 82 C154 136, 118 180, 72 186
               C28 192, -8 154, 4 102 C16 52, 50 22, 82 10 Z"
            fill="#D9CDBF" fillOpacity="0.52"
          />
        </svg>
      </div>

      {/* Small dusty rose accent blob — lower-left corner */}
      <div className="absolute" style={{ bottom: '24px', left: '-16px', width: '110px', height: '90px' }}>
        <svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M58 10 C84 0, 112 18, 108 50 C104 80, 72 96, 40 88
               C8 80, -6 52, 10 26 C22 6, 42 18, 58 10 Z"
            fill="#C9A898" fillOpacity="0.42"
          />
        </svg>
      </div>

      {/* Botanical sprig — layered over blobs */}
      <div className="absolute" style={{ bottom: '52px', left: '12px', width: '90px', height: '140px' }}>
        <BotanicalSprig />
      </div>

      {/* Scattered terracotta speckles */}
      <div className="absolute" style={{ bottom: '240px', left: '160px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.40 }} />
      <div className="absolute" style={{ bottom: '210px', left: '200px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.35 }} />
      <div className="absolute" style={{ bottom: '180px', left: '230px', width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.30 }} />
      <div className="absolute" style={{ bottom: '150px', left: '195px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.38 }} />
      <div className="absolute" style={{ bottom: '120px', left: '240px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.30 }} />
      <div className="absolute" style={{ bottom: '90px',  left: '215px', width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.28 }} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/feed`,
      });
      if (error) {
        setErrorMessage(error.message || 'Failed to sign in with Google');
        setIsGoogleLoading(false);
      }
    } catch {
      setErrorMessage('Failed to connect to Google. Please check your configuration.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await authClient.signIn.email({
        email: emailValidation.normalizedEmail || email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      navigate('/feed');
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      {/* ── Left panel ────────────────────────────────────────────────── */}
      <div
        className="relative hidden md:flex flex-col justify-between overflow-hidden"
        style={{
          width: '42%',
          minWidth: '340px',
          backgroundColor: 'var(--color-panel-login)',
          padding: '36px 40px 40px',
        }}
      >
        <PanelBlobs />

        {/* Wordmark */}
        <Link
          to="/"
          className="relative z-10 text-sm font-semibold tracking-[0.18em] uppercase"
          style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontSize: '0.95rem' }}
        >
          ANONIMY
        </Link>

        {/* Headline + subtext */}
        <div className="relative z-10">
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              marginBottom: '20px',
            }}
          >
            Say what you<br />really think.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
            Your identity stays yours.<br />
            Your thoughts can be heard.
          </p>
        </div>

        {/* Bottom spacer so blobs fill the lower section */}
        <div className="relative z-10" style={{ height: '220px' }} />
      </div>

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-8"
        style={{ backgroundColor: 'var(--color-surface-warm)' }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Heading */}
          <h1
            className="mb-1"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 3.5vw, 38px)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Welcome back
          </h1>
          <p className="mb-8" style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Continue to your account
          </p>

          {/* Error message alert banner */}
          {errorMessage && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm transition-all duration-150"
              style={{
                backgroundColor: 'rgba(180, 70, 70, 0.08)',
                border: '1px solid rgba(180, 70, 70, 0.25)',
                color: '#9E3838',
              }}
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate autoComplete="off">

            {/*
              Autofill honeypots — browsers autofill the first username/password
              fields they find. These hidden decoys absorb that, leaving the
              real fields below untouched. Combined with autoComplete="new-password"
              on the real inputs, this works across Chrome, Edge, and Firefox.
            */}
            <input type="text" name="username" style={{ display: 'none' }} aria-hidden="true" readOnly tabIndex={-1} />
            <input type="password" name="password" style={{ display: 'none' }} aria-hidden="true" readOnly tabIndex={-1} />

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="login-email"
                className="block mb-2 text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="text"
                name="anonimy-email"
                autoComplete="new-password"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-150 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-ui)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label
                htmlFor="login-password"
                className="block mb-2 text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="anonimy-password"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all duration-150 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-ui)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity duration-150 opacity-40 hover:opacity-70 cursor-pointer disabled:opacity-20"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>


            {/* Forgot password */}
            <div className="flex justify-end mb-8">
              <Link
                to="/forgot-password"
                className="text-sm transition-colors duration-150"
                style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-text-primary)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-ui)',
              }}
              onMouseEnter={e => {
                if (!isLoading && !isGoogleLoading) e.currentTarget.style.backgroundColor = '#2D2D2D';
              }}
              onMouseLeave={e => {
                if (!isLoading && !isGoogleLoading) e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
              }}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid var(--color-border)' }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 text-xs tracking-wider" style={{ backgroundColor: 'var(--color-surface-warm)', color: 'var(--color-text-muted)' }}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-ui)',
              }}
              onMouseEnter={e => {
                if (!isLoading && !isGoogleLoading) e.currentTarget.style.borderColor = 'var(--color-border-strong)';
              }}
              onMouseLeave={e => {
                if (!isLoading && !isGoogleLoading) e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <GoogleIcon />
              {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </button>
          </form>

          {/* Sign up redirect */}
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium transition-opacity duration-150"
              style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

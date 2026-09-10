import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { validateEmail } from '@/lib/email-validator';

// ─── Decorative botanical leafy sprig SVG ──
function LeafySprig() {
  return (
    <svg
      viewBox="0 0 110 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Main arching stem */}
      <path
        d="M30 155 C32 130, 38 108, 50 88 C62 68, 78 52, 88 32 C94 18, 96 8, 94 2"
        stroke="#4A5240" strokeWidth="1.3" strokeLinecap="round" fill="none"
      />
      {/* Left leaf 1 */}
      <path d="M46 100 C36 90, 24 84, 14 74 C24 76, 38 82, 46 100 Z" fill="#4A5240" fillOpacity="0.55" />
      {/* Right leaf 1 */}
      <path d="M52 88 C62 78, 74 72, 82 60 C72 64, 60 72, 52 88 Z" fill="#4A5240" fillOpacity="0.55" />
      {/* Left leaf 2 */}
      <path d="M60 72 C48 64, 36 56, 26 44 C38 50, 52 58, 60 72 Z" fill="#4A5240" fillOpacity="0.50" />
      {/* Right leaf 2 */}
      <path d="M66 60 C76 50, 86 40, 92 26 C82 34, 72 46, 66 60 Z" fill="#4A5240" fillOpacity="0.50" />
      {/* Left leaf 3 — smaller near tip */}
      <path d="M74 44 C64 36, 56 28, 52 16 C60 24, 70 34, 74 44 Z" fill="#4A5240" fillOpacity="0.42" />
      {/* Tip bud */}
      <circle cx="94" cy="2" r="3" fill="#4A5240" opacity="0.55" />
      {/* Seed dots scattered around */}
      <circle cx="20" cy="76" r="1.5" fill="#4A5240" opacity="0.40" />
      <circle cx="84" cy="58" r="1.2" fill="#4A5240" opacity="0.38" />
      <circle cx="28" cy="46" r="1.5" fill="#4A5240" opacity="0.35" />
      <circle cx="90" cy="28" r="1" fill="#4A5240" opacity="0.35" />
      <circle cx="14" cy="92" r="1" fill="#4A5240" opacity="0.32" />
      <circle cx="52" cy="18" r="1.2" fill="#4A5240" opacity="0.30" />
    </svg>
  );
}

// ─── Left panel decorative blobs (warm sand tones) ───────────────────────
function PanelBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 overflow-hidden">
      <div className="absolute" style={{ bottom: '70px', left: '-10px', width: '200px', height: '240px' }}>
        <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M100 12 C140 -4, 196 24, 198 90 C200 154, 162 218, 108 234
               C56 248, 4 214, -4 152 C-12 90, 28 20, 100 12 Z"
            fill="#C9B99A" fillOpacity="0.52"
          />
        </svg>
      </div>

      <div className="absolute" style={{ bottom: '40px', left: '72px', width: '168px', height: '200px' }}>
        <svg viewBox="0 0 168 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M86 10 C124 -2, 166 30, 164 88 C162 144, 124 190, 76 194
               C28 198, -8 160, 4 104 C14 50, 52 20, 86 10 Z"
            fill="#D9CDBF" fillOpacity="0.58"
          />
        </svg>
      </div>

      <div className="absolute" style={{ bottom: '46px', left: '100px', width: '84px', height: '124px' }}>
        <LeafySprig />
      </div>

      <div className="absolute" style={{ bottom: '270px', left: '130px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#8B7355', opacity: 0.38 }} />
      <div className="absolute" style={{ bottom: '248px', left: '170px', width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#8B7355', opacity: 0.32 }} />
      <div className="absolute" style={{ bottom: '218px', left: '155px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#8B7355', opacity: 0.35 }} />
      <div className="absolute" style={{ bottom: '188px', left: '190px', width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#8B7355', opacity: 0.28 }} />
      <div className="absolute" style={{ bottom: '160px', left: '60px',  width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#8B7355', opacity: 0.32 }} />
      <div className="absolute" style={{ bottom: '140px', left: '30px',  width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#8B7355', opacity: 0.28 }} />
    </div>
  );
}

// ─── Reusable password input with show/hide toggle ───────────────────────
function PasswordInput({
  id, value, onChange, placeholder, label, autoComplete, disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder ?? '••••••••••••'}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
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
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(v => !v)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity duration-150 opacity-40 hover:opacity-70 cursor-pointer disabled:opacity-20"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

// ─── 6-Digit Segmented OTP Input ──────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (idx: number, char: string) => {
    const clean = char.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = clean;
    const newVal = newDigits.join('').slice(0, 6);
    onChange(newVal);

    if (clean && idx < 5) {
      const nextInput = document.getElementById(`signup-otp-${idx + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      const prevInput = document.getElementById(`signup-otp-${idx - 1}`) as HTMLInputElement | null;
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const targetIdx = Math.min(Math.max(pasted.length - 1, 0), 5);
    const targetInput = document.getElementById(`signup-otp-${targetIdx}`) as HTMLInputElement | null;
    targetInput?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center mb-8">
      {digits.map((digit, i) => (
        <input
          key={i}
          id={`signup-otp-${i}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          disabled={disabled}
          autoComplete="off"
          className="rounded-xl text-center text-xl font-bold outline-none transition-all duration-150 disabled:opacity-50"
          style={{
            width: '48px',
            height: '56px',
            backgroundColor: 'var(--color-surface)',
            border: digit ? '2px solid var(--color-text-primary)' : '1.5px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-ui)',
          }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--color-text-primary)')}
          onBlurCapture={e => (e.currentTarget.style.borderColor = digit ? 'var(--color-text-primary)' : 'var(--color-border)')}
          aria-label={`Verification code digit ${i + 1}`}
        />
      ))}
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

// ─── Signup Page ──────────────────────────────────────────────────────────
export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep]         = useState<'form' | 'verify'>('form');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [otp, setOtp]           = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(c => Math.max(c - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/feed`,
      });
      if (error) {
        setErrorMessage(error.message || 'Failed to sign up with Google');
        setIsGoogleLoading(false);
      }
    } catch {
      setErrorMessage('Failed to connect to Google. Please check your configuration.');
      setIsGoogleLoading(false);
    }
  };

  // Step 1: Submit signup form -> triggers Mailtrap OTP email
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    if (password !== confirm) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const targetEmail = emailValidation.normalizedEmail || email.trim();
      const { error } = await authClient.signUp.email({
        email: targetEmail,
        password,
        name: targetEmail.split('@')[0],
      });

      if (error) {
        setErrorMessage(error.message || 'Registration failed. Email may already be registered.');
        setIsLoading(false);
        return;
      }

      // Transition to OTP verification step
      setStep('verify');
      setResendCooldown(60); // 60s cooldown
      setSuccessMessage('A 6-digit verification code was sent to your email.');
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await authClient.emailOtp.verifyEmail({
        email: normalizedEmail,
        otp: otp.trim(),
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid or expired verification code');
        setIsLoading(false);
        return;
      }

      // Ensure active session exists before navigating to feed
      if (password) {
        await authClient.signIn.email({
          email: normalizedEmail,
          password,
        }).catch(() => null);
      }

      setSuccessMessage('Email verified successfully! Redirecting to feed...');
      setTimeout(() => {
        navigate('/feed', { replace: true });
      }, 500);
    } catch {
      setErrorMessage('Verification failed. Please check the code and try again.');
      setIsLoading(false);
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: 'email-verification',
      });

      if (error) {
        setErrorMessage(error.message || 'Failed to resend code. Please try again.');
      } else {
        setSuccessMessage('New verification code sent! Check your Mailtrap inbox.');
        setResendCooldown(60);
        setOtp('');
      }
    } catch {
      setErrorMessage('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'var(--font-ui)' }}>

      {/* ── Left panel ────────────────────────────────────────────────── */}
      <div
        className="relative hidden md:flex flex-col justify-between overflow-hidden"
        style={{
          width: '42%',
          minWidth: '340px',
          backgroundColor: 'var(--color-panel-signup)',
          padding: '36px 40px 40px',
        }}
      >
        <PanelBlobs />

        {/* Wordmark */}
        <Link
          to="/"
          className="relative z-10 font-semibold tracking-[0.18em] uppercase"
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
            {step === 'form' ? (
              <>You can be<br />anonymous.</>
            ) : (
              <>Verify your<br />identity.</>
            )}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {step === 'form' ? (
              <>
                Your account keeps you<br />
                authenticated.<br />
                Your public identity<br />
                stays contextual.
              </>
            ) : (
              <>
                A 6-digit code has been sent<br />
                to your inbox.<br />
                Enter it to activate your account.
              </>
            )}
          </p>
        </div>

        {/* Spacer for blobs */}
        <div className="relative z-10" style={{ height: '230px' }} />
      </div>

      {/* ── Right panel — form / OTP ────────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-8"
        style={{ backgroundColor: 'var(--color-surface-warm)' }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {step === 'verify' && (
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 transition-opacity opacity-60 hover:opacity-100 cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <ArrowLeft size={14} /> Back to edit details
            </button>
          )}

          {/* Heading */}
          <h1
            className="mb-1"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(26px, 3.2vw, 36px)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {step === 'form' ? (
              'Join Anonimy today.'
            ) : (
              <span>
                Enter the 6-digit code sent to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
              </span>
            )}
          </p>

          {/* Error message alert */}
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

          {/* Success message banner */}
          {successMessage && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm transition-all duration-150"
              style={{
                backgroundColor: 'rgba(70, 140, 70, 0.08)',
                border: '1px solid rgba(70, 140, 70, 0.25)',
                color: '#2E6B34',
              }}
              role="status"
            >
              {successMessage}
            </div>
          )}

          {/* ── STEP 1: Registration Form ─────────────────────────────── */}
          {step === 'form' ? (
            <form onSubmit={handleSubmitForm} noValidate>
              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="signup-email"
                  className="block mb-2 text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
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
              <PasswordInput
                id="signup-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                disabled={isLoading}
              />

              {/* Confirm password */}
              <PasswordInput
                id="signup-confirm"
                label="Confirm password"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                disabled={isLoading}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-colors duration-150 cursor-pointer mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
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
                {isLoading ? 'Sending verification code...' : 'Sign up'}
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
          ) : (
            /* ── STEP 2: 6-Digit OTP Verification ────────────────────────── */
            <form onSubmit={handleVerifyOtp} noValidate>
              <div className="flex items-center justify-center mb-6">
                <div
                  className="p-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(74, 82, 64, 0.1)', color: '#4A5240' }}
                >
                  <Mail size={28} />
                </div>
              </div>

              {/* OTP Segmented Inputs */}
              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              />

              {/* Verify Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-text-primary)',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-ui)',
                }}
                onMouseEnter={e => {
                  if (!isLoading && otp.length === 6) e.currentTarget.style.backgroundColor = '#2D2D2D';
                }}
                onMouseLeave={e => {
                  if (!isLoading && otp.length === 6) e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
                }}
              >
                {isLoading ? 'Verifying code...' : 'Verify & Complete sign-up'}
              </button>

              {/* Resend Code */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity disabled:opacity-40 cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Didn’t receive a code? Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Log in redirect */}
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium transition-opacity duration-150"
              style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

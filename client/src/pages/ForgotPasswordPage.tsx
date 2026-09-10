import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { validateEmail } from '@/lib/email-validator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Decorative botanical SVG ─────────────────────────────────────────────────
function BotanicalSprig() {
  return (
    <svg
      viewBox="0 0 120 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <path
        d="M60 175 C58 140, 54 110, 50 80 C46 52, 42 28, 48 10"
        stroke="#4A5240" strokeWidth="1.2" strokeLinecap="round" fill="none"
      />
      <path d="M54 120 C42 112, 28 106, 18 96" stroke="#4A5240" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M52 100 C62 90, 74 84, 82 74" stroke="#4A5240" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M50 76 C38 70, 26 62, 16 50" stroke="#4A5240" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M49 58 C58 48, 68 40, 74 28" stroke="#4A5240" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Leaves */}
      <path d="M46 100 C36 90, 24 84, 14 74 C24 76, 38 82, 46 100 Z" fill="#4A5240" fillOpacity="0.45" />
      <path d="M52 88 C62 78, 74 72, 82 60 C72 64, 60 72, 52 88 Z" fill="#4A5240" fillOpacity="0.45" />
      <path d="M49 64 C37 58, 25 50, 15 38 C27 44, 41 52, 49 64 Z" fill="#4A5240" fillOpacity="0.38" />
      <path d="M50 46 C60 36, 70 28, 76 14 C66 22, 56 34, 50 46 Z" fill="#4A5240" fillOpacity="0.38" />
      {/* Tip bud */}
      <circle cx="48" cy="10" r="2.5" fill="#4A5240" opacity="0.55" />
      {/* Seed dots */}
      <circle cx="36" cy="108" r="1.2" fill="#4A5240" opacity="0.40" />
      <circle cx="68" cy="82" r="1" fill="#4A5240" opacity="0.38" />
      <circle cx="30" cy="64" r="1.2" fill="#4A5240" opacity="0.35" />
      <circle cx="60" cy="42" r="1" fill="#4A5240" opacity="0.35" />
    </svg>
  );
}

// ─── Left panel blobs ─────────────────────────────────────────────────────────
function PanelBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 overflow-hidden">
      {/* Large sage oval */}
      <div className="absolute" style={{ bottom: '60px', left: '10px', width: '230px', height: '270px' }}>
        <svg viewBox="0 0 230 270" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M115 12 C160 -8, 222 22, 226 88 C230 152, 198 218, 148 248
               C100 276, 40 264, 12 212 C-14 160, 6 82, 48 46 C74 22, 88 30, 115 12 Z"
            fill="#B8C3AE" fillOpacity="0.55"
          />
        </svg>
      </div>
      {/* Medium sand oval */}
      <div className="absolute" style={{ bottom: '32px', left: '78px', width: '165px', height: '195px' }}>
        <svg viewBox="0 0 165 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M84 10 C122 -4, 162 30, 160 88 C158 144, 120 186, 72 192
               C26 198, -8 156, 4 102 C16 52, 52 22, 84 10 Z"
            fill="#D9CDBF" fillOpacity="0.52"
          />
        </svg>
      </div>
      {/* Small dusty rose blob */}
      <div className="absolute" style={{ bottom: '22px', left: '-18px', width: '115px', height: '94px' }}>
        <svg viewBox="0 0 115 94" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M58 10 C86 0, 114 20, 110 54 C106 84, 72 100, 38 92
               C6 84, -8 54, 10 28 C24 8, 44 18, 58 10 Z"
            fill="#C9A898" fillOpacity="0.40"
          />
        </svg>
      </div>
      {/* Botanical sprig */}
      <div className="absolute" style={{ bottom: '50px', left: '10px', width: '88px', height: '138px' }}>
        <BotanicalSprig />
      </div>
      {/* Speckles */}
      <div className="absolute" style={{ bottom: '240px', left: '158px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.38 }} />
      <div className="absolute" style={{ bottom: '212px', left: '200px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.32 }} />
      <div className="absolute" style={{ bottom: '180px', left: '228px', width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.28 }} />
      <div className="absolute" style={{ bottom: '148px', left: '196px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#7A6040', opacity: 0.35 }} />
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { icon: Mail, label: 'Email' },
    { icon: ShieldCheck, label: 'Verify' },
    { icon: KeyRound, label: 'Reset' },
  ];

  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const num = i + 1;
        const isActive = num === step;
        const isDone = num < step;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: isDone
                    ? 'var(--color-text-primary)'
                    : isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-border)',
                  color: isActive || isDone ? '#FFFFFF' : 'var(--color-text-muted)',
                }}
              >
                {isDone ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 7L5 10L11 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <Icon size={14} />
                )}
              </div>
              <span
                className="text-xs"
                style={{
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="mb-4 transition-all duration-200"
                style={{
                  width: '32px',
                  height: '1px',
                  backgroundColor: num < step ? 'var(--color-text-primary)' : 'var(--color-border-strong)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Password input with toggle ───────────────────────────────────────────────
function PasswordInput({
  id, value, onChange, placeholder, label, disabled,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; label: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block mb-2 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          name={id}
          autoComplete="new-password"
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

// ─── OTP digit input ──────────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean && val !== '') return;

    const newDigits = [...digits];
    newDigits[i] = clean.slice(-1);
    const combined = newDigits.join('');
    onChange(combined);

    if (clean && i < 5) {
      const nextInput = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
      nextInput?.select();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[i] && i > 0) {
        const newDigits = [...digits];
        newDigits[i - 1] = '';
        onChange(newDigits.join(''));
        const prevInput = document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null;
        prevInput?.focus();
      } else if (digits[i]) {
        const newDigits = [...digits];
        newDigits[i] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      const prevInput = document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null;
      prevInput?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      const nextInput = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const targetIdx = Math.min(Math.max(pasted.length - 1, 0), 5);
    const targetInput = document.getElementById(`otp-${targetIdx}`) as HTMLInputElement | null;
    targetInput?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center mb-8">
      {digits.map((digit, i) => (
        <input
          key={i}
          id={`otp-${i}`}
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
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ─── Forgot Password Page ─────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ─── Step 1: Request OTP ────────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    setIsLoading(true); setError('');

    try {
      const res = await fetch(`${API}/api/password-reset/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValidation.normalizedEmail || email.trim() }),
      });
      const data = await res.json() as { error?: string; message?: string };
      if (!res.ok) { setError(data.error || 'Failed to send OTP. Please try again.'); return; }
      setSuccess(data.message || 'OTP sent! Check your email.');
      setTimeout(() => { setSuccess(''); setStep(2); }, 1200);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { setError('Please enter the complete 6-digit code'); return; }
    setIsLoading(true); setError('');

    try {
      const res = await fetch(`${API}/api/password-reset/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json() as { error?: string; resetToken?: string };
      if (!res.ok) { setError(data.error || 'Invalid OTP. Please try again.'); return; }
      setResetToken(data.resetToken ?? '');
      setSuccess('Code verified!');
      setTimeout(() => { setSuccess(''); setStep(3); }, 900);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 3: Reset Password ─────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { setError('Please fill in both password fields'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true); setError('');

    try {
      const res = await fetch(`${API}/api/password-reset/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), resetToken, newPassword }),
      });
      const data = await res.json() as { error?: string; message?: string };
      if (!res.ok) { setError(data.error || 'Failed to reset password. Please start over.'); return; }
      setSuccess('Password reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Shared input style helpers ─────────────────────────────────────────
  const inputStyle = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-ui)',
  } as React.CSSProperties;

  const btnStyle = {
    backgroundColor: 'var(--color-text-primary)',
    color: '#FFFFFF',
    fontFamily: 'var(--font-ui)',
  } as React.CSSProperties;

  // ─── Left panel copy per step ───────────────────────────────────────────
  const panelCopy = {
    1: { headline: <>Forgot your password?</>, sub: 'Enter your registered email\nand we\'ll send a reset code.' },
    2: { headline: <>Check your email.</>, sub: 'Enter the 6-digit code we\nsent to your inbox.' },
    3: { headline: <>Choose a new password.</>, sub: 'Pick something strong\nand memorable.' },
  };
  const copy = panelCopy[step];

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'var(--font-ui)' }}>

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
              whiteSpace: 'pre-line',
            }}
          >
            {copy.headline}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
            {copy.sub}
          </p>
        </div>

        <div className="relative z-10" style={{ height: '220px' }} />
      </div>

      {/* ── Right panel ───────────────────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-8"
        style={{ backgroundColor: 'var(--color-surface-warm)' }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Back to login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 mb-8 text-sm transition-colors duration-150"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>

          {/* Step indicator */}
          <StepIndicator step={step} />

          {/* Headings per step */}
          {step === 1 && (
            <>
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
                Reset your password
              </h1>
              <p className="mb-8" style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                We'll send a 6-digit code to your email.
              </p>
            </>
          )}
          {step === 2 && (
            <>
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
                Enter the code
              </h1>
              <p className="mb-2" style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                We sent a 6-digit code to
              </p>
              <p className="mb-8 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {email}
              </p>
            </>
          )}
          {step === 3 && (
            <>
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
                New password
              </h1>
              <p className="mb-8" style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                Choose a strong password for your account.
              </p>
            </>
          )}

          {/* Error banner */}
          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm transition-all duration-150"
              style={{
                backgroundColor: 'rgba(180, 70, 70, 0.08)',
                border: '1px solid rgba(180, 70, 70, 0.25)',
                color: '#9E3838',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm transition-all duration-150"
              style={{
                backgroundColor: 'rgba(60, 140, 80, 0.08)',
                border: '1px solid rgba(60, 140, 80, 0.25)',
                color: '#2A7040',
              }}
              role="status"
            >
              {success}
            </div>
          )}

          {/* ── Step 1: Email form ───────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} noValidate>
              <div className="mb-5">
                <label
                  htmlFor="fp-email"
                  className="block mb-2 text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  name="fp-email"
                  autoComplete="off"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-150 disabled:opacity-50"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={btnStyle}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#2D2D2D'; }}
                onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--color-text-primary)'; }}
              >
                {isLoading ? 'Sending code...' : 'Send reset code'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP form ─────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={btnStyle}
                onMouseEnter={e => { if (!isLoading && otp.length === 6) e.currentTarget.style.backgroundColor = '#2D2D2D'; }}
                onMouseLeave={e => { if (!isLoading && otp.length === 6) e.currentTarget.style.backgroundColor = 'var(--color-text-primary)'; }}
              >
                {isLoading ? 'Verifying...' : 'Verify code'}
              </button>
              <button
                type="button"
                onClick={() => { setOtp(''); setError(''); handleRequestOtp({ preventDefault: () => {} } as React.FormEvent); }}
                disabled={isLoading}
                className="w-full mt-3 py-2.5 rounded-xl text-sm transition-colors duration-150 cursor-pointer disabled:opacity-40"
                style={{ color: 'var(--color-text-secondary)', background: 'transparent', border: 'none', fontFamily: 'var(--font-ui)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                Didn't receive it? Resend code
              </button>
            </form>
          )}

          {/* ── Step 3: New password form ─────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} noValidate>
              <PasswordInput
                id="fp-new-password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                disabled={isLoading}
              />
              <PasswordInput
                id="fp-confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-colors duration-150 cursor-pointer mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={btnStyle}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#2D2D2D'; }}
                onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--color-text-primary)'; }}
              >
                {isLoading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          )}

          {/* Sign up redirect */}
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Remember your password?{' '}
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

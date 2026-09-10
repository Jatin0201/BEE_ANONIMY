/**
 * Button — primary interactive element.
 *
 * Variants:
 *  - primary   black bg, white text (e.g. "Get started", "Sign up")
 *  - ghost     transparent, no border — text-only action link
 *  - accent    terracotta — "Post", "Comment" CTAs inside the app
 *  - danger    pale terracotta bg, accent text — "Log out"
 */
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'ghost' | 'accent' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-text-primary)] text-white hover:bg-[#2D2D2D] active:bg-[#111]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
  accent:
    'bg-[var(--color-accent)] text-white hover:bg-[#A8694A] active:bg-[#8F5539]',
  danger:
    'bg-[var(--color-accent-light)] text-[var(--color-accent)] hover:bg-[#EADAD0]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)]',
  md: 'px-5 py-2.5 text-sm rounded-[var(--radius-pill)]',
  lg: 'px-6 py-3 text-base rounded-[var(--radius-pill)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium leading-none',
        'transition-colors duration-150',
        'cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

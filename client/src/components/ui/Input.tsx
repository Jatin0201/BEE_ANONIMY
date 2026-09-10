/**
 * Input — labeled text input with optional error state.
 * Used on Login and Signup forms.
 */
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Right-hand slot — used for the password visibility toggle */
  rightSlot?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightSlot, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-3 pr-11',
              'text-sm text-[var(--color-text-primary)]',
              'bg-[var(--color-surface)]',
              'border rounded-[var(--radius-md)]',
              'outline-none',
              'placeholder:text-[var(--color-text-muted)]',
              'transition-colors duration-150',
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-[var(--color-border)] focus:border-[var(--color-text-secondary)]',
              className,
            )}
            {...props}
          />

          {rightSlot && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {rightSlot}
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

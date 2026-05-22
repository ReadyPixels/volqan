'use client';

/**
 * @file components/ui/button.tsx
 * @description Button component with variants and sizes (shadcn/ui style).
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Variant & size maps
// ---------------------------------------------------------------------------

const VARIANTS = {
  default:
    'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] shadow-sm',
  destructive:
    'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/0.9)] shadow-sm',
  outline:
    'border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
  secondary:
    'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary)/0.8)] shadow-sm',
  ghost:
    'hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
  link:
    'text-[hsl(var(--primary))] underline-offset-4 hover:underline p-0 h-auto',
} as const;

const SIZES = {
  default: 'h-9 px-4 py-2 text-sm',
  sm: 'h-7 px-3 text-xs rounded-md',
  lg: 'h-11 px-8 text-base',
  icon: 'h-9 w-9',
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

// ---------------------------------------------------------------------------
// Button component
// ---------------------------------------------------------------------------

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, disabled, children, asChild: _asChild, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium',
          'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? 'Login failed');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm px-4">
      {/* Logo / brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--primary))] mb-4">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Volqan Admin</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Sign in to your admin panel</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[hsl(var(--foreground))]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@volqan.link"
              className={cn(
                'h-9 px-3 text-sm rounded-lg border border-[hsl(var(--border))]',
                'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]',
                'placeholder:text-[hsl(var(--muted-foreground))]',
                'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent',
                'transition-shadow duration-150',
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[hsl(var(--foreground))]">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                'h-9 px-3 text-sm rounded-lg border border-[hsl(var(--border))]',
                'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]',
                'placeholder:text-[hsl(var(--muted-foreground))]',
                'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent',
                'transition-shadow duration-150',
              )}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'h-9 px-4 text-sm font-medium rounded-lg',
              'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
              'hover:opacity-90 active:opacity-80 transition-opacity',
              'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

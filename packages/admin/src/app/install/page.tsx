'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Database } from 'lucide-react';

type ConnectionState = 'checking' | 'connected' | 'unreachable';

export default function InstallPage() {
  const router = useRouter();

  const [dbState, setDbState] = React.useState<ConnectionState>('checking');
  const [alreadyInstalled, setAlreadyInstalled] = React.useState(false);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [siteName, setSiteName] = React.useState('My Volqan Site');
  const [locale, setLocale] = React.useState<'en' | 'ar'>('en');

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const checkStatus = React.useCallback(async () => {
    setDbState('checking');
    try {
      const res = await fetch('/api/install/status');
      const data = (await res.json()) as { dbConnected: boolean; installed: boolean };
      if (data.installed) {
        setAlreadyInstalled(true);
        router.replace('/login');
        return;
      }
      setDbState(data.dbConnected ? 'connected' : 'unreachable');
    } catch {
      setDbState('unreachable');
    }
  }, [router]);

  React.useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, siteName, locale }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Setup failed. Please try again.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (alreadyInstalled) {
    return null;
  }

  return (
    <div className="w-full max-w-sm px-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img src="/favicon.svg" alt="Volqan" className="w-10 h-10 mb-3" />
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
          Set up Volqan
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Create your admin account to get started
        </p>
      </div>

      {/* Database connection status */}
      <div
        className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 mb-4 ${
          dbState === 'connected'
            ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
            : dbState === 'unreachable'
              ? 'bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))]'
              : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
        }`}
        role="status"
      >
        {dbState === 'checking' && <Loader2 className="w-4 h-4 animate-spin" />}
        {dbState === 'connected' && <CheckCircle2 className="w-4 h-4" />}
        {dbState === 'unreachable' && <XCircle className="w-4 h-4" />}
        <Database className="w-4 h-4" />
        <span>
          {dbState === 'checking' && 'Checking database connection…'}
          {dbState === 'connected' && 'Database connected'}
          {dbState === 'unreachable' && 'Database unreachable — check DATABASE_URL and try again'}
        </span>
        {dbState === 'unreachable' && (
          <button
            type="button"
            onClick={() => void checkStatus()}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>

      {/* Card */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="siteName" className="text-sm font-medium text-[hsl(var(--foreground))]">
              Site name
            </label>
            <input
              id="siteName"
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="locale" className="text-sm font-medium text-[hsl(var(--foreground))]">
              Language
            </label>
            <select
              id="locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value === 'ar' ? 'ar' : 'en')}
              className="w-full h-9 px-3 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition"
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
            </select>
          </div>

          <div className="border-t border-[hsl(var(--border))] pt-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[hsl(var(--foreground))]">
                Your name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full h-9 px-3 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition"
              />
            </div>

            <div className="space-y-1.5">
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
                placeholder="you@example.com"
                className="w-full h-9 px-3 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[hsl(var(--foreground))]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-9 px-3 pr-9 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-2.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" aria-live="assertive" className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || dbState !== 'connected' || !email || !password || !siteName}
            className="w-full h-9 flex items-center justify-center gap-2 text-sm font-medium rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Setting up…' : 'Create account & finish setup'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
        Powered by{' '}
        <a href="https://volqan.link" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))] hover:underline font-medium">
          Volqan
        </a>
      </p>
    </div>
  );
}

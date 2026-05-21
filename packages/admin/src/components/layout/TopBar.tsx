'use client';

/**
 * @file components/layout/TopBar.tsx
 * @description Admin top bar with breadcrumb, search, notifications, and user menu.
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function getBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Array<{ label: string; href: string }> = [{ label: 'Dashboard', href: '/' }];

  const labelMap: Record<string, string> = {
    content: 'Content',
    media: 'Media',
    extensions: 'Extensions',
    themes: 'Themes',
    users: 'Users',
    settings: 'Settings',
    types: 'Content Types',
    new: 'New',
  };

  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    // Skip dynamic segments like [id] representations
    const label = labelMap[seg] ?? (seg.startsWith('[') ? '' : seg.charAt(0).toUpperCase() + seg.slice(1));
    if (label) {
      crumbs.push({ label, href: path });
    }
  }

  return crumbs;
}

// ---------------------------------------------------------------------------
// Notification item shape
// ---------------------------------------------------------------------------

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Extension updated', description: 'acme/seo was updated to v2.1.0', time: '2m ago', read: false },
  { id: '2', title: 'New user registered', description: 'jane@example.com joined', time: '1h ago', read: false },
  { id: '3', title: 'Backup completed', description: 'Daily backup finished successfully', time: '3h ago', read: true },
];

// ---------------------------------------------------------------------------
// TopBar component
// ---------------------------------------------------------------------------

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }
  const breadcrumbs = getBreadcrumbs(pathname);

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [themeOpen, setThemeOpen] = React.useState(false);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setNotifOpen(false);
        setUserOpen(false);
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const themeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <header
      className={cn(
        'h-14 flex items-center px-4 gap-4 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]',
        className,
      )}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm flex-1 min-w-0" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] flex-shrink-0" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-medium text-[hsl(var(--foreground))] truncate">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors truncate"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Search */}
      <div className="relative">
        {searchOpen ? (
          <input
            autoFocus
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onBlur={() => { setSearchOpen(false); setSearchValue(''); }}
            placeholder="Search..."
            className={cn(
              'w-56 h-8 px-3 pr-8 text-sm rounded-md border border-[hsl(var(--border))]',
              'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]',
              'placeholder:text-[hsl(var(--muted-foreground))]',
              'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
            )}
          />
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              'flex items-center gap-2 h-8 px-3 text-sm rounded-md',
              'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
              'border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
              'transition-colors duration-150',
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Search...</span>
            <kbd className="hidden sm:inline text-[10px] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Theme toggle */}
      <div className="relative" data-dropdown>
        <button
          onClick={() => setThemeOpen((v) => !v)}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-md',
            'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
            'hover:bg-[hsl(var(--accent))] transition-colors duration-150',
          )}
          aria-label="Toggle theme"
        >
          <ThemeIcon className="w-4 h-4" />
        </button>
        {themeOpen && (
          <div className={cn(
            'absolute right-0 top-full mt-1 w-36 rounded-md border border-[hsl(var(--border))]',
            'bg-[hsl(var(--popover))] shadow-lg py-1 z-50 animate-fade-in',
          )}>
            {([['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'System', Monitor]] as const).map(
              ([value, label, Icon]) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); setThemeOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-1.5 text-sm',
                    'hover:bg-[hsl(var(--accent))] transition-colors',
                    theme === value
                      ? 'text-[hsl(var(--primary))] font-medium'
                      : 'text-[hsl(var(--popover-foreground))]',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative" data-dropdown>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className={cn(
            'relative w-8 h-8 flex items-center justify-center rounded-md',
            'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
            'hover:bg-[hsl(var(--accent))] transition-colors duration-150',
          )}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--destructive))] rounded-full" />
          )}
        </button>

        {notifOpen && (
          <div className={cn(
            'absolute right-0 top-full mt-1 w-80 rounded-md border border-[hsl(var(--border))]',
            'bg-[hsl(var(--popover))] shadow-lg z-50 animate-fade-in overflow-hidden',
          )}>
            <div className="px-4 py-2.5 border-b border-[hsl(var(--border))]">
              <h3 className="text-sm font-semibold text-[hsl(var(--popover-foreground))]">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'px-4 py-3 border-b border-[hsl(var(--border))] last:border-0',
                    'hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer',
                    !n.read && 'bg-[hsl(var(--primary)/0.04)]',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-medium truncate', !n.read && 'text-[hsl(var(--primary))]')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-1">{n.description}</p>
                    </div>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex-shrink-0">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative" data-dropdown>
        <button
          onClick={() => setUserOpen((v) => !v)}
          className={cn(
            'flex items-center gap-2 h-8 px-2 rounded-md',
            'hover:bg-[hsl(var(--accent))] transition-colors duration-150',
          )}
          aria-label="User menu"
        >
          <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-white">A</span>
          </div>
          <span className="hidden sm:inline text-sm font-medium text-[hsl(var(--foreground))]">Admin</span>
        </button>

        {userOpen && (
          <div className={cn(
            'absolute right-0 top-full mt-1 w-48 rounded-md border border-[hsl(var(--border))]',
            'bg-[hsl(var(--popover))] shadow-lg z-50 animate-fade-in py-1',
          )}>
            <div className="px-3 py-2 border-b border-[hsl(var(--border))]">
              <p className="text-xs font-semibold text-[hsl(var(--popover-foreground))]">Admin User</p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">admin@example.com</p>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-[hsl(var(--popover-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
              onClick={() => setUserOpen(false)}
            >
              <User className="w-3.5 h-3.5" /> Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-[hsl(var(--popover-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
              onClick={() => setUserOpen(false)}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
            <div className="border-t border-[hsl(var(--border))] mt-1 pt-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--accent))] transition-colors"
                onClick={() => { setUserOpen(false); handleSignOut(); }}
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

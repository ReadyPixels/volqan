'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Sun, Moon, Monitor, LogOut, User, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

function getBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Array<{ label: string; href: string }> = [{ label: 'Dashboard', href: '/' }];
  const labelMap: Record<string, string> = {
    content: 'Content', media: 'Media', extensions: 'Extensions', themes: 'Themes',
    users: 'Users', settings: 'Settings', types: 'Content Types', new: 'New',
    analytics: 'Analytics', billing: 'Billing', ai: 'AI Assistant', pages: 'Pages',
    profile: 'Profile',
  };
  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const label = labelMap[seg] ?? (seg.startsWith('[') ? '' : seg.charAt(0).toUpperCase() + seg.slice(1));
    if (label) crumbs.push({ label, href: path });
  }
  return crumbs;
}

interface Notification { id: string; title: string; description: string; time: string; }

/** Admin destinations searchable from the top bar quick-search. */
const SEARCH_TARGETS: Array<{ label: string; href: string; keywords: string }> = [
  { label: 'Dashboard', href: '/', keywords: 'home overview stats' },
  { label: 'Content', href: '/content', keywords: 'entries posts articles' },
  { label: 'Content Types', href: '/content/types', keywords: 'schema fields models' },
  { label: 'Pages', href: '/pages', keywords: 'page builder blocks' },
  { label: 'Media', href: '/media', keywords: 'images uploads files library' },
  { label: 'Extensions', href: '/extensions', keywords: 'plugins addons marketplace' },
  { label: 'Themes', href: '/themes', keywords: 'design tokens appearance' },
  { label: 'Users', href: '/users', keywords: 'team members roles invite' },
  { label: 'Analytics', href: '/analytics', keywords: 'traffic activity charts' },
  { label: 'AI Assistant', href: '/ai', keywords: 'assistant chat bot' },
  { label: 'Billing', href: '/billing', keywords: 'subscription plan invoices payment' },
  { label: 'Settings', href: '/settings', keywords: 'configuration api keys email storage' },
  { label: 'Profile', href: '/profile', keywords: 'account password avatar' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface UserData { name: string; email: string; initials: string; }

export function TopBar({ className }: Readonly<{ className?: string }>) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const breadcrumbs = getBreadcrumbs(pathname);

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [themeOpen, setThemeOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserData>({ name: 'Admin', email: 'admin@example.com', initials: 'A' });
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  // Recent activity from the audit log doubles as the notification feed
  React.useEffect(() => {
    fetch('/api/audit-log?perPage=5')
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data?: Array<{ id: string; action: string; resource: string; createdAt: string }> } | null) => {
        if (!body?.data) return;
        setNotifications(
          body.data.map((e) => ({
            id: e.id,
            title: e.action.replace(/\./g, ' '),
            description: e.resource,
            time: timeAgo(e.createdAt),
          })),
        );
      })
      .catch(() => null);
  }, []);

  React.useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user) {
        const name = d.user.name ?? d.user.email ?? 'Admin';
        const initials = name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
        setUser({ name, email: d.user.email ?? '', initials });
      }
    }).catch(() => null);
  }, []);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-dropdown]')) {
        setNotifOpen(false); setUserOpen(false); setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  let ThemeIcon = Monitor;
  if (theme === 'dark') ThemeIcon = Moon;
  else if (theme === 'light') ThemeIcon = Sun;

  return (
    <header className={cn('topbar', className)}>
      {/* Breadcrumb */}
      <nav className="topbar__breadcrumb" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <ChevronRight className="w-3 h-3 topbar__sep flex-shrink-0" aria-hidden="true" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="topbar__crumb topbar__crumb--active">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="topbar__crumb">{crumb.label}</Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Search (quick navigation) */}
      <div className="relative flex-shrink-0" data-dropdown>
        {searchOpen ? (
          <>
            <input
              autoFocus
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onBlur={() => setTimeout(() => { setSearchOpen(false); setSearchValue(''); }, 150)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setSearchOpen(false); setSearchValue(''); }
                if (e.key === 'Enter') {
                  const first = SEARCH_TARGETS.find((t) =>
                    `${t.label} ${t.keywords}`.toLowerCase().includes(searchValue.toLowerCase()),
                  );
                  if (first) {
                    globalThis.location.href = first.href;
                  }
                }
              }}
              placeholder="Go to…"
              aria-label="Search admin pages"
              className="input"
              style={{ width: 220, height: 32, fontSize: 13 }}
            />
            {searchValue && (
              <div className="dropdown" style={{ left: 0, top: 'calc(100% + 6px)', width: 220, maxHeight: 260, overflowY: 'auto' }}>
                {SEARCH_TARGETS.filter((t) =>
                  `${t.label} ${t.keywords}`.toLowerCase().includes(searchValue.toLowerCase()),
                ).map((t) => (
                  <Link key={t.href} href={t.href} className="dropdown-item" onClick={() => { setSearchOpen(false); setSearchValue(''); }}>
                    {t.label}
                  </Link>
                ))}
                {SEARCH_TARGETS.every((t) => !`${t.label} ${t.keywords}`.toLowerCase().includes(searchValue.toLowerCase())) && (
                  <div className="dropdown-item" aria-disabled="true" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    No matching pages
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="topbar__search"
            aria-label="Open search"
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Search…</span>
            <kbd className="topbar__kbd hidden sm:inline">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Theme toggle */}
      <div className="relative flex-shrink-0" data-dropdown>
        <button
          onClick={() => setThemeOpen(v => !v)}
          className="topbar__action"
          aria-label="Toggle theme"
        >
          <ThemeIcon className="w-4 h-4" aria-hidden="true" />
        </button>
        {themeOpen && (
          <div className="dropdown" style={{ right: 0, top: 'calc(100% + 6px)', width: 140 }}>
            {([['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'System', Monitor]] as const).map(
              ([value, label, Icon]) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); setThemeOpen(false); }}
                  className={cn('dropdown-item', theme === value && 'font-medium')}
                  style={{ color: theme === value ? 'hsl(var(--primary))' : undefined }}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative flex-shrink-0" data-dropdown>
        <button
          onClick={() => setNotifOpen(v => !v)}
          className="topbar__action"
          aria-label={notifications.length > 0 ? `Recent activity (${notifications.length})` : 'Recent activity'}
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {notifications.length > 0 && <span className="notif-dot" aria-hidden="true" />}
        </button>

        {notifOpen && (
          <div className="dropdown" style={{ right: 0, top: 'calc(100% + 6px)', width: 300 }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid hsl(var(--border))' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--foreground))' }}>Recent activity</span>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications.length === 0 && (
                <div className="dropdown-item" style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}>
                  No recent activity.
                </div>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="dropdown-item"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 2,
                    borderBottom: '1px solid hsl(var(--border) / 0.5)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 550, color: 'hsl(var(--foreground))', textTransform: 'capitalize' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}>
                      {n.time}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{n.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative flex-shrink-0" data-dropdown>
        <button
          onClick={() => setUserOpen(v => !v)}
          className={cn('topbar__action', 'gap-2')}
          style={{ width: 'auto', padding: '0 8px' }}
          aria-label="User menu"
        >
          <div className="topbar__avatar" aria-hidden="true">{user.initials}</div>
          <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 500, color: 'hsl(var(--foreground))' }}>
            {user.name}
          </span>
        </button>

        {userOpen && (
          <div className="dropdown" style={{ right: 0, top: 'calc(100% + 6px)', width: 192 }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid hsl(var(--border))' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--foreground))' }}>{user.name}</div>
              <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{user.email}</div>
            </div>
            <Link href="/profile" className="dropdown-item" onClick={() => setUserOpen(false)}>
              <User className="w-3.5 h-3.5" aria-hidden="true" /> Profile
            </Link>
            <Link href="/settings" className="dropdown-item" onClick={() => setUserOpen(false)}>
              <Settings className="w-3.5 h-3.5" aria-hidden="true" /> Settings
            </Link>
            <div className="dropdown-sep" />
            <button
              className="dropdown-item dropdown-item--danger"
              onClick={async () => {
                setUserOpen(false);
                await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
                globalThis.location.href = '/login';
              }}
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

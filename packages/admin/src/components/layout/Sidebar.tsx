'use client';

/**
 * @file components/layout/Sidebar.tsx
 * @description Collapsible admin sidebar with navigation, active states, and smooth transitions.
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Image,
  Puzzle,
  Palette,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ChevronDown,
  FileText,
  Database,
  CreditCard,
  LayoutTemplate,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Navigation config
// ---------------------------------------------------------------------------

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
  children?: Array<{ key: string; label: string; href: string; icon: React.ComponentType<{ className?: string }> }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    key: 'content',
    label: 'Content',
    href: '/content',
    icon: Layers,
    children: [
      { key: 'content-types', label: 'Content Types', href: '/content/types', icon: Database },
      { key: 'content-entries', label: 'All Entries', href: '/content', icon: FileText },
    ],
  },
  {
    key: 'pages',
    label: 'Pages',
    href: '/pages',
    icon: LayoutTemplate,
  },
  {
    key: 'media',
    label: 'Media',
    href: '/media',
    icon: Image,
  },
  {
    key: 'extensions',
    label: 'Extensions',
    href: '/extensions',
    icon: Puzzle,
  },
  {
    key: 'themes',
    label: 'Themes',
    href: '/themes',
    icon: Palette,
  },
  {
    key: 'users',
    label: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    key: 'billing',
    label: 'Billing',
    href: '/billing',
    icon: CreditCard,
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    key: 'bazarix',
    label: 'Bazarix Marketplace',
    href: 'https://bazarix.link',
    icon: ExternalLink,
    external: true,
  },
];

// ---------------------------------------------------------------------------
// Sidebar context
// ---------------------------------------------------------------------------

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarContext);
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set(['content']));

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]',
        'transition-all duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-[60px]' : 'w-[240px]',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-14 px-4 border-b border-[hsl(var(--border))] flex-shrink-0',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-label="Volqan">
                <path
                  d="M12 2L3 7v10l9 5 9-5V7L12 2z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-[hsl(var(--foreground))] tracking-tight">
              Volqan
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-label="Volqan">
              <path
                d="M12 2L3 7v10l9 5 9-5V7L12 2z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href) && !item.external;
          const hasChildren = item.children && item.children.length > 0;
          const expanded = expandedItems.has(item.key);

          if (item.external) {
            return (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium',
                  'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
                  'hover:bg-[hsl(var(--accent))] transition-colors duration-150',
                  'group relative',
                  collapsed && 'justify-center px-0',
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </>
                )}
                {collapsed && (
                  <span className="sr-only">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-[hsl(var(--border))]">
                    {item.label}
                  </div>
                )}
              </a>
            );
          }

          return (
            <div key={item.key}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(item.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium',
                    'transition-colors duration-150 group relative',
                    active
                      ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          expanded ? 'rotate-180' : '',
                        )}
                      />
                    </>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-[hsl(var(--border))]">
                      {item.label}
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium',
                    'transition-colors duration-150 group relative',
                    active
                      ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-[hsl(var(--border))]">
                      {item.label}
                    </div>
                  )}
                </Link>
              )}

              {/* Children */}
              {hasChildren && !collapsed && expanded && (
                <div className="mt-0.5 ml-4 pl-2 border-l border-[hsl(var(--border))] space-y-0.5">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.key}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium',
                          'transition-colors duration-150',
                          childActive
                            ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]',
                        )}
                      >
                        <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="flex-shrink-0 p-2 border-t border-[hsl(var(--border))]">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm',
            'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
            'hover:bg-[hsl(var(--accent))] transition-colors duration-150',
            collapsed && 'justify-center',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

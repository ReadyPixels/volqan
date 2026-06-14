'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Layers, Image, Puzzle, Palette, Users, Settings,
  ChevronRight, ChevronLeft, ExternalLink, ChevronDown, FileText,
  Database, CreditCard, LayoutTemplate, TrendingUp, Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavChild { key: string; label: string; href: string; icon: React.ComponentType<{ className?: string }>; }
interface NavItem  { key: string; label: string; href: string; icon: React.ComponentType<{ className?: string }>; external?: boolean; badge?: string; children?: NavChild[]; }

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
      {
        key: 'content', label: 'Content', href: '/content', icon: Layers,
        children: [
          { key: 'content-types',   label: 'Content Types', href: '/content/types', icon: Database },
          { key: 'content-entries', label: 'All Entries',   href: '/content',       icon: FileText },
        ],
      },
      { key: 'pages',  label: 'Pages',  href: '/pages',  icon: LayoutTemplate },
      { key: 'media',  label: 'Media',  href: '/media',  icon: Image },
    ],
  },
  {
    label: 'Platform',
    items: [
      { key: 'extensions', label: 'Extensions', href: '/extensions', icon: Puzzle },
      { key: 'themes',     label: 'Themes',     href: '/themes',     icon: Palette },
      { key: 'users',      label: 'Users',       href: '/users',      icon: Users },
      { key: 'analytics',  label: 'Analytics',   href: '/analytics',  icon: TrendingUp },
      { key: 'ai',         label: 'AI Assistant',href: '/ai',         icon: Bot },
    ],
  },
  {
    label: 'Account',
    items: [
      { key: 'billing',  label: 'Billing',  href: '/billing',  icon: CreditCard },
      { key: 'settings', label: 'Settings', href: '/settings', icon: Settings },
      { key: 'bazarix',  label: 'Bazarix',  href: 'https://bazarix.link', icon: ExternalLink, external: true },
    ],
  },
] satisfies { label: string; items: NavItem[] }[];

interface SidebarContextValue { collapsed: boolean; setCollapsed: (v: boolean) => void; }
export const SidebarContext = React.createContext<SidebarContextValue>({ collapsed: false, setCollapsed: () => {} });
export function useSidebar() { return React.useContext(SidebarContext); }

interface SidebarProps { readonly collapsed: boolean; readonly onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['content']));

  const toggle = (key: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  const isActive = (href: string, external?: boolean) => {
    if (external) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn('sidebar', collapsed ? 'sidebar--collapsed' : 'sidebar--expanded')}
      aria-label="Sidebar"
    >
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M10 2v18M3 6l7 4 7-4" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
          </svg>
        </div>
        {!collapsed && <span className="sidebar__logo-text">Volqan</span>}
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="sidebar__nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="sidebar__section-label">{section.label}</div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.external);
              const hasChildren = !!item.children?.length;
              const isExpanded = expanded.has(item.key);

              if (item.external) {
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-item"
                  >
                    <Icon className="nav-item__icon" aria-hidden="true" />
                    {!collapsed && <span className="nav-item__label">{item.label}</span>}
                    {!collapsed && <ExternalLink className="w-3 h-3 opacity-40" aria-hidden="true" />}
                    {collapsed && <span className="sr-only">{item.label}</span>}
                    {collapsed && <span className="nav-item__tooltip">{item.label}</span>}
                  </a>
                );
              }

              return (
                <div key={item.key}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggle(item.key)}
                      aria-expanded={isExpanded}
                      aria-controls={`nav-sub-${item.key}`}
                      className={cn('nav-item', active && 'nav-item--active')}
                    >
                      <Icon className="nav-item__icon" aria-hidden="true" />
                      {!collapsed && (
                        <>
                          <span className="nav-item__label">{item.label}</span>
                          <ChevronDown
                            className={cn('w-3.5 h-3.5 opacity-50 transition-transform duration-200', isExpanded && 'rotate-180')}
                            aria-hidden="true"
                          />
                        </>
                      )}
                      {collapsed && <span className="sr-only">{item.label}</span>}
                      {collapsed && <span className="nav-item__tooltip">{item.label}</span>}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn('nav-item', active && 'nav-item--active')}
                    >
                      <Icon className="nav-item__icon" aria-hidden="true" />
                      {!collapsed && (
                        <>
                          <span className="nav-item__label">{item.label}</span>
                          {item.badge && <span className="nav-item__badge">{item.badge}</span>}
                        </>
                      )}
                      {collapsed && <span className="sr-only">{item.label}</span>}
                      {collapsed && <span className="nav-item__tooltip">{item.label}</span>}
                    </Link>
                  )}

                  {hasChildren && !collapsed && isExpanded && (
                    <div id={`nav-sub-${item.key}`} className="nav-children">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.key}
                            href={child.href}
                            aria-current={childActive ? 'page' : undefined}
                            className={cn('nav-item', childActive && 'nav-item--active')}
                            style={{ fontSize: '12.5px', padding: '5px 10px' }}
                          >
                            <ChildIcon className="nav-item__icon" style={{ width: 13, height: 13 }} aria-hidden="true" />
                            <span className="nav-item__label">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="sidebar__footer">
        <button
          onClick={onToggle}
          className="sidebar__toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" aria-hidden="true" />
            : <><ChevronLeft className="w-4 h-4" aria-hidden="true" /><span style={{ fontSize: 12 }}>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}

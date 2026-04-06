'use client';

/**
 * @file app/themes/page.tsx
 * @description Theme manager with preview, activate, and live token editor.
 */

import * as React from 'react';
import { Palette, ExternalLink, Check, ShoppingBag, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { buildMarketplaceURL } from '@volqan/core';

// ---------------------------------------------------------------------------
// Deep link URL
// ---------------------------------------------------------------------------

const MARKETPLACE_URL = buildMarketplaceURL('theme');

// ---------------------------------------------------------------------------
// Mock themes
// ---------------------------------------------------------------------------

interface Theme {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  active: boolean;
  preview: string;
  tokens: Record<string, string>;
  marketplace?: boolean;
  category: 'light' | 'dark' | 'colorful' | 'minimal' | 'enterprise';
}

const THEMES: Theme[] = [
  {
    id: 'volqan/default',
    name: 'Volqan Default',
    description: 'Clean, professional light theme with blue accent.',
    author: 'Volqan',
    version: '1.0.0',
    active: true,
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop',
    category: 'light',
    tokens: {
      '--volqan-color-primary': '#3b82f6',
      '--volqan-color-secondary': '#64748b',
      '--volqan-color-accent': '#f59e0b',
      '--volqan-color-background': '#f8fafc',
      '--volqan-color-surface': '#ffffff',
    },
  },
  {
    id: 'volqan/dark',
    name: 'Volqan Dark',
    description: 'Sleek dark theme for power users working at night.',
    author: 'Volqan',
    version: '1.0.0',
    active: false,
    preview: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop',
    category: 'dark',
    tokens: {
      '--volqan-color-primary': '#60a5fa',
      '--volqan-color-secondary': '#94a3b8',
      '--volqan-color-accent': '#fbbf24',
      '--volqan-color-background': '#0f172a',
      '--volqan-color-surface': '#1e293b',
    },
  },
  {
    id: 'acme/carbon',
    name: 'Carbon Enterprise',
    description: 'Dense, data-focused enterprise theme inspired by IBM Carbon.',
    author: 'Acme Design',
    version: '2.1.0',
    active: false,
    preview: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
    category: 'enterprise',
    marketplace: true,
    tokens: {
      '--volqan-color-primary': '#0f62fe',
      '--volqan-color-secondary': '#8d8d8d',
      '--volqan-color-accent': '#ff832b',
      '--volqan-color-background': '#f4f4f4',
      '--volqan-color-surface': '#ffffff',
    },
  },
  {
    id: 'studio/aurora',
    name: 'Aurora',
    description: 'Vibrant gradient theme with purple-to-cyan color spectrum.',
    author: 'Studio3',
    version: '1.3.0',
    active: false,
    preview: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=225&fit=crop',
    category: 'colorful',
    marketplace: true,
    tokens: {
      '--volqan-color-primary': '#8b5cf6',
      '--volqan-color-secondary': '#6366f1',
      '--volqan-color-accent': '#06b6d4',
      '--volqan-color-background': '#faf5ff',
      '--volqan-color-surface': '#ffffff',
    },
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  light: 'Light',
  dark: 'Dark',
  colorful: 'Colorful',
  minimal: 'Minimal',
  enterprise: 'Enterprise',
};

// ---------------------------------------------------------------------------
// Token editor
// ---------------------------------------------------------------------------

function TokenEditor({ tokens, onChange }: {
  tokens: Record<string, string>;
  onChange: (tokens: Record<string, string>) => void;
}) {
  return (
    <div className="space-y-3">
      {Object.entries(tokens).map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] flex-1 min-w-0 truncate">{key}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange({ ...tokens, [key]: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-[hsl(var(--border))] p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange({ ...tokens, [key]: e.target.value })}
              className="w-24 h-7 px-2 text-xs font-mono rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ThemesPage() {
  const [themes, setThemes] = React.useState(THEMES);
  const [editingTokens, setEditingTokens] = React.useState<string | null>(null);
  const [editedTokens, setEditedTokens] = React.useState<Record<string, string>>({});

  const activeTheme = themes.find((t) => t.active);

  const handleActivate = (id: string) => {
    setThemes((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
  };

  const startTokenEdit = (theme: Theme) => {
    setEditingTokens(theme.id);
    setEditedTokens({ ...theme.tokens });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Themes</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Active: <strong>{activeTheme?.name}</strong> · {themes.length} installed
          </p>
        </div>
        <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            Browse Themes
            <ExternalLink className="w-3 h-3" />
          </Button>
        </a>
      </div>

      <Tabs defaultValue="installed">
        <TabsList>
          <TabsTrigger value="installed">Installed ({themes.length})</TabsTrigger>
          <TabsTrigger value="token-editor">Token Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="installed">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {themes.map((theme) => (
              <Card
                key={theme.id}
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  theme.active && 'ring-2 ring-[hsl(var(--primary))]',
                )}
              >
                {/* Preview */}
                <div className="aspect-video overflow-hidden bg-[hsl(var(--muted)/0.3)] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theme.preview}
                    alt={`${theme.name} preview`}
                    className="w-full h-full object-cover"
                  />
                  {theme.active && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="success" className="gap-1">
                        <Check className="w-3 h-3" /> Active
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {CATEGORY_LABELS[theme.category]}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">{theme.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{theme.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">by {theme.author}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">v{theme.version}</span>
                    {theme.marketplace && <Badge variant="outline" className="text-[10px]">Marketplace</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  {/* Color swatches */}
                  <div className="flex gap-1 mb-4">
                    {Object.values(theme.tokens).slice(0, 5).map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {!theme.active && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleActivate(theme.id)}
                      >
                        Activate
                      </Button>
                    )}
                    {theme.active && (
                      <Button size="sm" variant="secondary" className="flex-1" disabled>
                        <Check className="w-3.5 h-3.5" /> Active
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startTokenEdit(theme)}
                    >
                      <Palette className="w-3.5 h-3.5" />
                    </Button>
                    {theme.marketplace && (
                      <a href={`https://bazarix.link/themes/${theme.id}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add more themes CTA */}
            <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
              <Card className="border-dashed cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.02)] transition-colors h-full min-h-[280px] flex items-center justify-center">
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
                  <p className="text-sm font-medium">Browse Bazarix</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Find premium themes</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </TabsContent>

        <TabsContent value="token-editor">
          <Card>
            <CardHeader>
              <CardTitle>Live Token Editor</CardTitle>
              <CardDescription>
                {editingTokens
                  ? `Editing tokens for: ${themes.find((t) => t.id === editingTokens)?.name}`
                  : 'Select a theme above to edit its tokens, or start editing the active theme below.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTheme && (
                <div className="space-y-4">
                  {!editingTokens && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startTokenEdit(activeTheme)}
                    >
                      Edit {activeTheme.name} Tokens
                    </Button>
                  )}
                  {editingTokens && (
                    <>
                      <TokenEditor
                        tokens={editedTokens}
                        onChange={setEditedTokens}
                      />
                      <div className="flex items-center gap-2 pt-4 border-t border-[hsl(var(--border))]">
                        <Button
                          size="sm"
                          onClick={() => {
                            setThemes((prev) =>
                              prev.map((t) =>
                                t.id === editingTokens ? { ...t, tokens: editedTokens } : t,
                              ),
                            );
                            setEditingTokens(null);
                          }}
                        >
                          Save Tokens
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTokens(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

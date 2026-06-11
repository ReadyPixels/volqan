'use client';

import * as React from 'react';
import { Palette, ExternalLink, Check, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const MARKETPLACE_URL = `https://bazarix.link/themes?source=volqan`;

interface Theme {
  id: string;
  themeId: string;
  name: string;
  version: string;
  active: boolean;
  tokens: Record<string, string>;
}

function TokenEditor({ tokens, onChange }: Readonly<{
  tokens: Record<string, string>;
  onChange: (tokens: Record<string, string>) => void;
}>) {
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

export default function ThemesPage() {
  const [themes, setThemes] = React.useState<Theme[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editedTokens, setEditedTokens] = React.useState<Record<string, string>>({});

  const load = React.useCallback(() => {
    fetch('/api/themes')
      .then((r) => r.json() as Promise<{ data: Theme[] }>)
      .then(({ data }) => setThemes(data))
      .catch(() => setError('Failed to load themes.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleActivate = async (id: string) => {
    setThemes((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
    await fetch(`/api/themes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true }),
    });
  };

  const handleSaveTokens = async () => {
    if (!editingId) return;
    setThemes((prev) => prev.map((t) => t.id === editingId ? { ...t, tokens: editedTokens } : t));
    await fetch(`/api/themes/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens: editedTokens }),
    });
    setEditingId(null);
  };

  const activeTheme = themes.find((t) => t.active);

  let subtitle = 'Loading...';
  if (!loading) {
    subtitle = activeTheme ? `Active: ${activeTheme.name} - ${themes.length} installed` : `${themes.length} installed`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Themes</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{subtitle}</p>
        </div>
        <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            Browse Themes
            <ExternalLink className="w-3 h-3" />
          </Button>
        </a>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      <Tabs defaultValue="installed">
        <TabsList>
          <TabsTrigger value="installed">Installed ({themes.length})</TabsTrigger>
          <TabsTrigger value="token-editor">Token Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="installed">
          {!loading && themes.length === 0 && !error && (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Palette className="w-10 h-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">No themes installed</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Browse the Bazarix marketplace to find themes.</p>
                <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-1.5">Open Bazarix <ExternalLink className="w-3.5 h-3.5" /></Button>
                </a>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {themes.map((theme) => (
              <Card
                key={theme.id}
                className={cn('overflow-hidden transition-all duration-200', theme.active && 'ring-2 ring-[hsl(var(--primary))]')}
              >
                <div className="aspect-video bg-[hsl(var(--muted)/0.3)] relative flex items-center justify-center">
                  <div className="flex gap-2">
                    {Object.entries(theme.tokens).slice(0, 5).map(([key, color]) => (
                      <div key={key} className="w-8 h-8 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  {theme.active && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="success" className="gap-1"><Check className="w-3 h-3" /> Active</Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm">{theme.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">v{theme.version}</span>
                    <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">{theme.themeId}</span>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="flex items-center gap-2">
                    {theme.active ? (
                      <Button size="sm" variant="secondary" className="flex-1" disabled>
                        <Check className="w-3.5 h-3.5" /> Active
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={() => handleActivate(theme.id)}>Activate</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(theme.id); setEditedTokens({ ...theme.tokens }); }}>
                      <Palette className="w-3.5 h-3.5" />
                    </Button>
                    <a href={`https://bazarix.link/themes/${theme.themeId}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost"><ExternalLink className="w-3.5 h-3.5" /></Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}

            <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
              <Card className="border-dashed cursor-pointer hover:border-[hsl(var(--primary))] transition-colors h-full min-h-[280px] flex items-center justify-center">
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
                {editingId
                  ? `Editing tokens for: ${themes.find((t) => t.id === editingId)?.name}`
                  : 'Select a theme above to edit its tokens.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTheme && !editingId && (
                <Button variant="outline" size="sm" onClick={() => { setEditingId(activeTheme.id); setEditedTokens({ ...activeTheme.tokens }); }}>
                  Edit {activeTheme.name} Tokens
                </Button>
              )}
              {editingId && (
                <div className="space-y-4">
                  <TokenEditor tokens={editedTokens} onChange={setEditedTokens} />
                  <div className="flex items-center gap-2 pt-4 border-t border-[hsl(var(--border))]">
                    <Button size="sm" onClick={handleSaveTokens}>Save Tokens</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

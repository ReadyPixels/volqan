'use client';

/**
 * @file app/settings/page.tsx
 * @description Settings page organized by group: General, Email, Storage, API Keys, Installation.
 */

import * as React from 'react';
import { Save, RefreshCw, Key, Copy, Eye, EyeOff, Check, Globe, Mail, HardDrive, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useLocale } from '@/components/layout/LocaleProvider';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Settings section wrapper
// ---------------------------------------------------------------------------

function SettingSection({
  title,
  description,
  children,
  onSave,
  saving,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
        {onSave && (
          <div className="pt-2 border-t border-[hsl(var(--border))]">
            <Button size="sm" loading={saving} onClick={onSave}>
              <Save className="w-4 h-4" />
              Save changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// API key row
// ---------------------------------------------------------------------------

function ApiKeyRow({ name, value, onRevoke }: { name: string; value: string; onRevoke: () => void }) {
  const [visible, setVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const copyKey = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs font-mono text-[hsl(var(--muted-foreground))] mt-0.5">
          {visible ? value : `${value.slice(0, 8)}${'•'.repeat(24)}${value.slice(-4)}`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide key' : 'Show key'}
        >
          {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={copyKey} aria-label="Copy key">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-[hsl(var(--destructive))]"
          onClick={onRevoke}
          aria-label="Revoke key"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface ApiKey { id: string; name: string; prefix: string; scopes: string[]; createdAt: string; key?: string; }

interface InstallationInfo {
  version: string;
  installationId: string | null;
  plan: string;
  nodeVersion: string;
  database: string;
  environment: string;
  uptimeSeconds: number;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} day${days === 1 ? '' : 's'}, ${hours} hour${hours === 1 ? '' : 's'}`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'}, ${minutes} min`;
  return `${minutes} min`;
}

export default function SettingsPage() {
  const { setLocale } = useLocale();
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = React.useState(false);

  // General settings state
  const [siteName, setSiteName] = React.useState('');
  const [siteUrl, setSiteUrl] = React.useState('');
  const [siteDescription, setSiteDescription] = React.useState('');
  const [defaultLocale, setDefaultLocale] = React.useState('en');

  // Email settings state
  const [smtpHost, setSmtpHost] = React.useState('');
  const [smtpPort, setSmtpPort] = React.useState('587');
  const [smtpUser, setSmtpUser] = React.useState('');
  const [fromEmail, setFromEmail] = React.useState('');

  // Storage settings
  const [storageProvider, setStorageProvider] = React.useState('local');

  // Installation info
  const [installInfo, setInstallInfo] = React.useState<InstallationInfo | null>(null);

  React.useEffect(() => {
    fetch('/api/settings/installation')
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data?: InstallationInfo } | null) => {
        if (body?.data) setInstallInfo(body.data);
      })
      .catch(() => null);
  }, []);

  // API keys
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = React.useState('');
  const [creatingKey, setCreatingKey] = React.useState(false);
  const [newKeyValue, setNewKeyValue] = React.useState<string | null>(null);

  // Load settings + API keys on mount
  React.useEffect(() => {
    Promise.all([
      fetch('/api/settings').then((r) => r.json() as Promise<{ data?: Record<string, string> }>),
      fetch('/api/settings/api-keys').then((r) => r.json() as Promise<{ data?: ApiKey[] }>),
    ]).then(([settingsRes, keysRes]) => {
      const s = settingsRes.data ?? {};
      if (s['site.name']) setSiteName(s['site.name']);
      if (s['site.url']) setSiteUrl(s['site.url']);
      if (s['site.description']) setSiteDescription(s['site.description']);
      if (s['site.locale']) setDefaultLocale(s['site.locale']);
      if (s['email.smtp.host']) setSmtpHost(s['email.smtp.host']);
      if (s['email.smtp.port']) setSmtpPort(s['email.smtp.port']);
      if (s['email.smtp.user']) setSmtpUser(s['email.smtp.user']);
      if (s['email.from']) setFromEmail(s['email.from']);
      if (s['storage.provider']) setStorageProvider(s['storage.provider']);
      setApiKeys(keysRes.data ?? []);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const handleSave = async (group: string, data: Record<string, string>) => {
    setSaving((s) => ({ ...s, [group]: true }));
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // Apply locale (lang + text direction) immediately after a successful save
      if (res.ok && data['site.locale'] && (data['site.locale'] === 'en' || data['site.locale'] === 'ar')) {
        setLocale(data['site.locale'] as 'en' | 'ar');
      }
    } finally {
      setSaving((s) => ({ ...s, [group]: false }));
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName) return;
    setCreatingKey(true);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = (await res.json()) as { data?: ApiKey };
      if (data.data) {
        setApiKeys((prev) => [data.data!, ...prev]);
        setNewKeyValue(data.data.key ?? null);
        setNewKeyName('');
      }
    } finally {
      setCreatingKey(false);
    }
  };

  const [pendingRevoke, setPendingRevoke] = React.useState<ApiKey | null>(null);
  const [revoking, setRevoking] = React.useState(false);

  const handleRevokeKey = (id: string) => {
    setPendingRevoke(apiKeys.find((k) => k.id === id) ?? null);
  };

  const confirmRevokeKey = async () => {
    if (!pendingRevoke) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/settings/api-keys/${pendingRevoke.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Revoke failed (${res.status})`);
      setApiKeys((prev) => prev.filter((k) => k.id !== pendingRevoke.id));
    } finally {
      setRevoking(false);
      setPendingRevoke(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Settings</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Configure your Volqan installation.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general"><Globe className="w-3.5 h-3.5 mr-1.5" />General</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-3.5 h-3.5 mr-1.5" />Email</TabsTrigger>
          <TabsTrigger value="storage"><HardDrive className="w-3.5 h-3.5 mr-1.5" />Storage</TabsTrigger>
          <TabsTrigger value="api"><Key className="w-3.5 h-3.5 mr-1.5" />API Keys</TabsTrigger>
          <TabsTrigger value="installation"><Info className="w-3.5 h-3.5 mr-1.5" />Installation</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <SettingSection
            title="General Settings"
            description="Basic site configuration and metadata."
            onSave={() => handleSave('general', { 'site.name': siteName, 'site.url': siteUrl, 'site.description': siteDescription, 'site.locale': defaultLocale })}
            saving={saving.general}
          >
            <Input
              label="Site Name"
              value={siteName}
              onChange={(e: any) => setSiteName(e.target.value)}
              hint="Displayed in the browser tab and admin header."
            />
            <Input
              label="Site URL"
              type="url"
              value={siteUrl}
              onChange={(e: any) => setSiteUrl(e.target.value)}
              hint="The public URL of your site."
            />
            <Input
              label="Site Description"
              value={siteDescription}
              onChange={(e: any) => setSiteDescription(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Locale</label>
              <select
                value={defaultLocale}
                onChange={(e: any) => setDefaultLocale(e.target.value)}
                className="w-full h-9 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <option value="en">English (en)</option>
                <option value="ar">Arabic (ar)</option>
              </select>
            </div>
          </SettingSection>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <SettingSection
            title="Email Configuration"
            description="Configure SMTP settings for outbound emails."
            onSave={() => handleSave('email', { 'email.smtp.host': smtpHost, 'email.smtp.port': smtpPort, 'email.smtp.user': smtpUser, 'email.from': fromEmail })}
            saving={saving.email}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SMTP Host"
                value={smtpHost}
                onChange={(e: any) => setSmtpHost(e.target.value)}
                placeholder="smtp.example.com"
              />
              <Input
                label="SMTP Port"
                type="number"
                value={smtpPort}
                onChange={(e: any) => setSmtpPort(e.target.value)}
                placeholder="587"
              />
            </div>
            <Input
              label="SMTP Username"
              value={smtpUser}
              onChange={(e: any) => setSmtpUser(e.target.value)}
              placeholder="your-smtp-username"
            />
            <Input
              label="SMTP Password"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="From Email"
              type="email"
              value={fromEmail}
              onChange={(e: any) => setFromEmail(e.target.value)}
              hint="The sender address for all outbound emails."
            />
            <Button variant="outline" size="sm" disabled title="Available once SMTP settings are saved and verified">
              Send test email (coming soon)
            </Button>
          </SettingSection>
        </TabsContent>

        {/* Storage */}
        <TabsContent value="storage">
          <SettingSection
            title="Storage Provider"
            description="Configure where uploaded media files are stored."
            onSave={() => handleSave('storage', { 'storage.provider': storageProvider })}
            saving={saving.storage}
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStorageProvider('local')}
                aria-pressed={storageProvider === 'local'}
                className={cn(
                  'p-3 rounded-lg border text-sm font-medium transition-colors text-left',
                  storageProvider === 'local'
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                    : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
                )}
              >
                Local Disk
              </button>
              <div
                aria-disabled="true"
                className="p-3 rounded-lg border border-dashed border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--muted-foreground))] cursor-not-allowed"
              >
                AWS S3
                <span className="block text-xs font-normal mt-0.5">Not yet available — S3 uploads land in a future release.</span>
              </div>
            </div>

            {storageProvider === 'local' && (
              <div className="mt-2 p-3 rounded-lg bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))] text-sm">
                <p className="text-[hsl(var(--muted-foreground))]">
                  Files are stored at the path set by <code className="font-mono text-xs bg-[hsl(var(--muted))] px-1 py-0.5 rounded">VOLQAN_UPLOAD_DIR</code>
                  {' '}(default <code className="font-mono text-xs bg-[hsl(var(--muted))] px-1 py-0.5 rounded">/public/uploads</code>).
                </p>
              </div>
            )}
          </SettingSection>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for external integrations.</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Input
                    placeholder="Key name…"
                    value={newKeyName}
                    onChange={(e: any) => setNewKeyName(e.target.value)}
                    className="w-40"
                  />
                  <Button size="sm" variant="outline" loading={creatingKey} onClick={handleCreateKey} disabled={!newKeyName}>
                    <Key className="w-4 h-4" /> Generate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {newKeyValue && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-sm">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Key created — copy it now</p>
                  <code className="text-xs font-mono break-all">{newKeyValue}</code>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">This key will not be shown again.</p>
                </div>
              )}
              {apiKeys.length === 0 && loaded && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] py-2">No API keys yet.</p>
              )}
              {apiKeys.map((key) => (
                <ApiKeyRow
                  key={key.id}
                  name={key.name}
                  value={`vq_${key.prefix}${'•'.repeat(24)}`}
                  onRevoke={() => handleRevokeKey(key.id)}
                />
              ))}
              <div className="p-3 rounded-lg bg-[hsl(var(--muted)/0.3)] text-xs text-[hsl(var(--muted-foreground))]">
                API keys provide full access to the Volqan API. Keep them secret and rotate regularly.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Installation */}
        <TabsContent value="installation">
          <Card>
            <CardHeader>
              <CardTitle>Installation Info</CardTitle>
              <CardDescription>Details about this Volqan instance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!installInfo && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading installation details…</p>
              )}
              {installInfo && [
                { label: 'Volqan Version', value: installInfo.version },
                { label: 'Installation ID', value: installInfo.installationId ?? 'not initialized', mono: true },
                { label: 'Plan', value: installInfo.plan, badge: <Badge variant="secondary">{installInfo.plan}</Badge> },
                { label: 'Node.js Version', value: installInfo.nodeVersion },
                { label: 'Database', value: installInfo.database },
                { label: 'Environment', value: installInfo.environment, badge: <Badge variant="secondary">{installInfo.environment}</Badge> },
                { label: 'Uptime', value: formatUptime(installInfo.uptimeSeconds) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0 text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('font-medium', item.mono && 'font-mono text-xs')}>
                      {item.value}
                    </span>
                    {item.badge}
                  </div>
                </div>
              ))}

              <div className="pt-4 flex items-center gap-2">
                <a href="https://volqan.link/docs" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">View Documentation</Button>
                </a>
                <a href="https://bazarix.link" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">Manage License</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!pendingRevoke}
        onOpenChange={(open) => !open && setPendingRevoke(null)}
        title="Revoke API key"
        description={`The key "${pendingRevoke?.name ?? ''}" will stop working immediately. This cannot be undone.`}
        confirmLabel="Revoke"
        loading={revoking}
        onConfirm={confirmRevokeKey}
      />
    </div>
  );
}

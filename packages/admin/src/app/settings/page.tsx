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

export default function SettingsPage() {
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});

  const handleSave = async (group: string) => {
    setSaving((s) => ({ ...s, [group]: true }));
    await new Promise((r) => setTimeout(r, 700));
    setSaving((s) => ({ ...s, [group]: false }));
  };

  // General settings state
  const [siteName, setSiteName] = React.useState('My Volqan Site');
  const [siteUrl, setSiteUrl] = React.useState('https://example.com');
  const [siteDescription, setSiteDescription] = React.useState('Powered by Volqan CMS');
  const [defaultLocale, setDefaultLocale] = React.useState('en');

  // Email settings state
  const [smtpHost, setSmtpHost] = React.useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = React.useState('587');
  const [smtpUser, setSmtpUser] = React.useState('');
  const [fromEmail, setFromEmail] = React.useState('noreply@example.com');

  // Storage settings
  const [storageProvider, setStorageProvider] = React.useState('local');

  // API keys
  const [apiKeys] = React.useState([
    { name: 'Production API Key', value: 'vq_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' },
    { name: 'Development API Key', value: 'vq_dev_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4' },
  ]);

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
            onSave={() => handleSave('general')}
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
                <option value="fr">French (fr)</option>
                <option value="de">German (de)</option>
                <option value="es">Spanish (es)</option>
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
            onSave={() => handleSave('email')}
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
            <Button variant="outline" size="sm">Send test email</Button>
          </SettingSection>
        </TabsContent>

        {/* Storage */}
        <TabsContent value="storage">
          <SettingSection
            title="Storage Provider"
            description="Configure where uploaded media files are stored."
            onSave={() => handleSave('storage')}
            saving={saving.storage}
          >
            <div className="grid grid-cols-3 gap-3">
              {['local', 's3', 'gcs'].map((provider) => (
                <button
                  key={provider}
                  onClick={() => setStorageProvider(provider)}
                  className={cn(
                    'p-3 rounded-lg border text-sm font-medium transition-colors text-left',
                    storageProvider === provider
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
                  )}
                >
                  {provider === 'local' && 'Local Disk'}
                  {provider === 's3' && 'AWS S3'}
                  {provider === 'gcs' && 'Google Cloud'}
                </button>
              ))}
            </div>

            {storageProvider === 's3' && (
              <div className="space-y-4 mt-2 p-4 rounded-lg bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                <Input label="S3 Bucket Name" placeholder="my-volqan-bucket" />
                <Input label="AWS Region" placeholder="us-east-1" />
                <Input label="AWS Access Key ID" placeholder="AKIAIOSFODNN7EXAMPLE" />
                <Input label="AWS Secret Access Key" type="password" placeholder="••••••••" />
              </div>
            )}

            {storageProvider === 'gcs' && (
              <div className="space-y-4 mt-2 p-4 rounded-lg bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                <Input label="GCS Bucket Name" placeholder="my-volqan-bucket" />
                <Input label="Service Account JSON" type="textarea" placeholder='{"type": "service_account", ...}' />
              </div>
            )}

            {storageProvider === 'local' && (
              <div className="mt-2 p-3 rounded-lg bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))] text-sm">
                <p className="text-[hsl(var(--muted-foreground))]">
                  Files are stored at <code className="font-mono text-xs bg-[hsl(var(--muted))] px-1 py-0.5 rounded">/public/uploads</code>.
                  Not recommended for production.
                </p>
              </div>
            )}
          </SettingSection>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for external integrations.</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Key className="w-4 h-4" />
                  Generate Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiKeys.map((key) => (
                <ApiKeyRow
                  key={key.name}
                  name={key.name}
                  value={key.value}
                  onRevoke={() => alert('Key revoked')}
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
              {[
                { label: 'Volqan Version', value: '1.0.0', badge: <Badge variant="success">Latest</Badge> },
                { label: 'Installation ID', value: 'inst_a1b2c3d4e5f6', mono: true },
                { label: 'Node.js Version', value: 'v22.4.0' },
                { label: 'Database', value: 'PostgreSQL 16.2' },
                { label: 'Environment', value: 'Production', badge: <Badge variant="secondary">production</Badge> },
                { label: 'Uptime', value: '14 days, 3 hours' },
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
    </div>
  );
}

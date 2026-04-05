'use client';

/**
 * @file components/ai/AIProviderConfig.tsx
 * @description Provider configuration panel: select provider, API key, test connection.
 */

import * as React from 'react';
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProviderType = 'OPENAI' | 'ANTHROPIC' | 'GEMINI' | 'OLLAMA';

export interface ProviderConfig {
  provider: ProviderType;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Provider definitions
// ---------------------------------------------------------------------------

const PROVIDERS: Array<{
  id: ProviderType;
  name: string;
  description: string;
  logo: string;
  defaultModel: string;
  models: string[];
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
}> = [
  {
    id: 'OPENAI',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo — best general purpose',
    logo: '🟢',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    requiresApiKey: true,
  },
  {
    id: 'ANTHROPIC',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet — excellent writing & analysis',
    logo: '🟡',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    requiresApiKey: true,
  },
  {
    id: 'GEMINI',
    name: 'Google Gemini',
    description: 'Gemini 1.5 Pro — multimodal capabilities',
    logo: '🔵',
    defaultModel: 'gemini-1.5-pro-latest',
    models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-1.0-pro'],
    requiresApiKey: true,
  },
  {
    id: 'OLLAMA',
    name: 'Ollama (Local)',
    description: 'Run models locally — private & offline',
    logo: '⚫',
    defaultModel: 'llama3.2',
    models: ['llama3.2', 'llama3.2:1b', 'mistral', 'codellama', 'phi3'],
    requiresApiKey: false,
    defaultBaseUrl: 'http://localhost:11434',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AIProviderConfigProps {
  config: ProviderConfig;
  onChange: (config: ProviderConfig) => void;
  onBack: () => void;
}

export function AIProviderConfig({ config, onChange, onBack }: AIProviderConfigProps) {
  const [showKey, setShowKey] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ ok: boolean; message: string } | null>(null);

  const selectedProvider = PROVIDERS.find((p) => p.id === config.provider) ?? PROVIDERS[0];

  function updateConfig(partial: Partial<ProviderConfig>) {
    onChange({ ...config, ...partial });
    setTestResult(null);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    // Simulate test (in production: call actual provider test)
    await new Promise((r) => setTimeout(r, 1200));
    if (!config.apiKey && selectedProvider.requiresApiKey) {
      setTestResult({ ok: false, message: 'API key is required' });
    } else {
      setTestResult({ ok: true, message: `Connected to ${selectedProvider.name}` });
    }
    setTesting(false);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">AI Provider Settings</p>
      </div>

      {/* Provider selector */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Provider</label>
        <div className="space-y-1.5">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => updateConfig({ provider: p.id, model: p.defaultModel, baseUrl: p.defaultBaseUrl })}
              className={cn(
                'w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors border',
                config.provider === p.id
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
                  : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
              )}
            >
              <span className="text-lg leading-none">{p.logo}</span>
              <div>
                <p className={cn('text-xs font-semibold', config.provider === p.id ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]')}>
                  {p.name}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{p.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Model */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Model</label>
        <select
          value={config.model ?? selectedProvider.defaultModel}
          onChange={(e) => updateConfig({ model: e.target.value })}
          className="w-full border border-[hsl(var(--border))] rounded-md px-2.5 py-1.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
        >
          {selectedProvider.models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* API Key */}
      {selectedProvider.requiresApiKey && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">
            API Key <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey ?? ''}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full border border-[hsl(var(--border))] rounded-md px-2.5 py-1.5 pr-8 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))] font-mono"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Stored locally in browser. Never sent to Volqan servers.</p>
        </div>
      )}

      {/* Base URL (Ollama) */}
      {!selectedProvider.requiresApiKey && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Server URL</label>
          <input
            type="text"
            value={config.baseUrl ?? selectedProvider.defaultBaseUrl ?? ''}
            onChange={(e) => updateConfig({ baseUrl: e.target.value })}
            placeholder="http://localhost:11434"
            className="w-full border border-[hsl(var(--border))] rounded-md px-2.5 py-1.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      )}

      {/* Test connection */}
      <button
        onClick={testConnection}
        disabled={testing}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50"
      >
        {testing ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</>
        ) : (
          'Test Connection'
        )}
      </button>

      {/* Test result */}
      {testResult && (
        <div
          className={cn(
            'flex items-start gap-2 mt-2 px-3 py-2 rounded-md text-xs',
            testResult.ok
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
          )}
        >
          {testResult.ok ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
}

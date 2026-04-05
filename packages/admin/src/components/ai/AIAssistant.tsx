'use client';

/**
 * @file components/ai/AIAssistant.tsx
 * @description Floating AI assistant panel (slide-in from right).
 * Cmd+K to open, full chat interface with streaming.
 */

import * as React from 'react';
import {
  X,
  Minimize2,
  Settings,
  Send,
  Bot,
  Loader2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIMessageItem, type ChatMessage } from './AIMessage';
import { AIPromptSuggestions } from './AIPromptSuggestions';
import { AIProviderConfig, type ProviderConfig, type ProviderType } from './AIProviderConfig';

// ---------------------------------------------------------------------------
// Provider indicator
// ---------------------------------------------------------------------------

const PROVIDER_LABELS: Record<ProviderType, { label: string; color: string }> = {
  OPENAI: { label: 'GPT-4o', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' },
  ANTHROPIC: { label: 'Claude', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
  GEMINI: { label: 'Gemini', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
  OLLAMA: { label: 'Ollama', color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800' },
};

// ---------------------------------------------------------------------------
// AIAssistant
// ---------------------------------------------------------------------------

interface AIAssistantProps {
  initialOpen?: boolean;
}

export function AIAssistant({ initialOpen = false }: AIAssistantProps) {
  const [open, setOpen] = React.useState(initialOpen);
  const [minimized, setMinimized] = React.useState(false);
  const [showConfig, setShowConfig] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const [providerConfig, setProviderConfig] = React.useState<ProviderConfig>({
    provider: 'OPENAI',
    model: 'gpt-4o',
  });

  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setMinimized(false);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Auto-scroll
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  React.useEffect(() => {
    if (open && !minimized && !showConfig) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized, showConfig]);

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------

  async function sendMessage(content: string) {
    if (!content.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    // Add streaming placeholder
    const assistantId = Math.random().toString(36).slice(2);
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    // Simulate streaming response (in production: use AIManager.streamMessage)
    const response = await simulateAIResponse(content, providerConfig);

    let accumulated = '';
    for await (const chunk of response) {
      accumulated += chunk;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: accumulated } : m,
        ),
      );
    }

    // Mark done
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, streaming: false } : m,
      ),
    );
    setStreaming(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  // ---------------------------------------------------------------------------
  // Floating button (when closed)
  // ---------------------------------------------------------------------------

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setMinimized(false); }}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        title="Open AI Assistant (⌘K)"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // Main panel
  // ---------------------------------------------------------------------------

  const providerInfo = PROVIDER_LABELS[providerConfig.provider];

  return (
    <div
      className={cn(
        'fixed right-6 bottom-6 z-50 w-96 bg-[hsl(var(--card))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] flex flex-col overflow-hidden transition-all duration-300',
        minimized ? 'h-14' : 'h-[600px]',
        'max-h-[calc(100vh-7rem)]',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
            <Bot className="w-4 h-4 text-[hsl(var(--primary-foreground))]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] leading-tight">AI Assistant</p>
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', providerInfo.color)}>
              {providerInfo.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!minimized && (
            <>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] px-2 py-1 rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowConfig((v) => !v)}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  showConfig
                    ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]',
                )}
                title="Provider settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setMinimized((v) => !v)}
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            {minimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body (hidden when minimized) */}
      {!minimized && (
        <>
          {/* Config panel */}
          {showConfig ? (
            <div className="flex-1 overflow-y-auto p-4">
              <AIProviderConfig
                config={providerConfig}
                onChange={setProviderConfig}
                onBack={() => setShowConfig(false)}
              />
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
                      <Sparkles className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">How can I help?</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Ask me anything or try a suggestion below
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <AIMessageItem key={msg.id} message={msg} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Prompt suggestions (only when empty) */}
              {messages.length === 0 && (
                <div className="px-4 pb-3">
                  <AIPromptSuggestions onSelect={(prompt) => setInput(prompt)} />
                </div>
              )}

              {/* Input */}
              <div className="px-4 pb-4 pt-2 border-t border-[hsl(var(--border))] flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message AI... (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    className="flex-1 resize-none border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] max-h-28 overflow-y-auto"
                    style={{ minHeight: '42px' }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = Math.min(el.scrollHeight, 112) + 'px';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || streaming}
                    className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 flex-shrink-0"
                  >
                    {streaming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5 text-center">
                  {providerConfig.apiKey
                    ? `Using ${providerConfig.model ?? 'default model'}`
                    : 'Configure API key in ⚙ settings'}
                  {' · ⌘K to toggle'}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simulated streaming response (remove in production, use AIManager)
// ---------------------------------------------------------------------------

async function* simulateAIResponse(
  prompt: string,
  _config: ProviderConfig,
): AsyncGenerator<string> {
  const responses: string[] = [
    "I'd be happy to help with that! ",
    "Here's what I can suggest:\n\n",
    "**Key points to consider:**\n\n",
    "1. Start by defining your goals clearly\n",
    "2. Research your target audience thoroughly\n",
    "3. Create a content structure that flows naturally\n",
    "4. Use clear, engaging language throughout\n\n",
    "Would you like me to elaborate on any of these points, or shall I help you draft the actual content?",
  ];

  if (prompt.toLowerCase().includes('blog')) {
    yield "# Getting Started with Headless CMS\n\n";
    yield "In today's rapidly evolving digital landscape, **headless CMS** has emerged as the go-to solution for modern web development teams.\n\n";
    yield "## What Makes Headless CMS Different?\n\n";
    yield "Unlike traditional CMS platforms, a headless approach separates the content layer from the presentation layer. ";
    yield "This means your content can be delivered to **any device or channel** — websites, mobile apps, smart TVs, or even voice assistants.\n\n";
    yield "## Key Benefits\n\n";
    yield "- **Flexibility**: Build your frontend with any technology\n";
    yield "- **Performance**: Serve content via fast APIs and CDNs\n";
    yield "- **Scalability**: Handle millions of requests efficiently\n";
    yield "- **Developer experience**: Clean APIs and modern workflows\n\n";
    yield "Ready to transform your content strategy? [Learn more about Volqan →](/docs)";
    return;
  }

  for (const chunk of responses) {
    yield chunk;
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 80));
  }
}

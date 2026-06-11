'use client';

import { AIAssistant } from '@/components/ai/AIAssistant';
import { Bot } from 'lucide-react';

export default function AIPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Use Cmd+K (or Ctrl+K) to open the AI panel. Configure your provider via the settings icon inside the panel.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground space-y-2">
        <p>The AI assistant is available across all admin pages via keyboard shortcut.</p>
        <p>
          Supported providers: <strong>OpenAI</strong>, <strong>Anthropic</strong>,{' '}
          <strong>Google Gemini</strong>, and <strong>Ollama</strong> (local).
        </p>
        <p>
          To configure your API key and model, click the settings icon inside the AI panel after
          opening it with <kbd className="px-1 py-0.5 rounded border text-xs font-mono">Cmd+K</kbd>.
        </p>
      </div>

      {/* Open the panel immediately when navigating to this page */}
      <AIAssistant initialOpen />
    </div>
  );
}

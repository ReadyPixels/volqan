'use client';

/**
 * @file components/ai/AIPromptSuggestions.tsx
 * @description Suggested prompt chips for the AI assistant.
 */

import * as React from 'react';
import { Sparkles, FileText, Search, LayoutTemplate, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Prompt config
// ---------------------------------------------------------------------------

interface PromptSuggestion {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  prompt: string;
  color: string;
}

const SUGGESTIONS: PromptSuggestion[] = [
  {
    icon: FileText,
    label: 'Generate blog post',
    prompt: 'Write a 500-word blog post about the benefits of headless CMS for modern web development.',
    color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40',
  },
  {
    icon: Search,
    label: 'Optimize SEO',
    prompt: 'Help me improve the SEO meta title and description for a page about headless CMS features. The page is about our content management capabilities.',
    color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40',
  },
  {
    icon: LayoutTemplate,
    label: 'Create page layout',
    prompt: 'Suggest a page layout structure for a SaaS product landing page. List the sections and blocks I should include.',
    color: 'text-violet-600 bg-violet-50 hover:bg-violet-100 dark:text-violet-400 dark:bg-violet-900/20 dark:hover:bg-violet-900/40',
  },
  {
    icon: BookOpen,
    label: 'Summarize content',
    prompt: 'Summarize the following content in 2-3 sentences for use as a meta description:',
    color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20 dark:hover:bg-amber-900/40',
  },
  {
    icon: Sparkles,
    label: 'Rewrite for clarity',
    prompt: 'Rewrite the following text to be clearer and more engaging for a general audience:',
    color: 'text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-900/20 dark:hover:bg-rose-900/40',
  },
  {
    icon: FileText,
    label: 'Write product description',
    prompt: 'Write a compelling product description for an e-commerce product. Include key benefits, features, and a call to action.',
    color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AIPromptSuggestionsProps {
  onSelect: (prompt: string) => void;
}

export function AIPromptSuggestions({ onSelect }: AIPromptSuggestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] px-1">Suggestions</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => onSelect(s.prompt)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                s.color,
              )}
            >
              <Icon className="w-3 h-3" />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

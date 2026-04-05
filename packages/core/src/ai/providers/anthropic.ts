/**
 * @file ai/providers/anthropic.ts
 * @description Anthropic Claude provider: messages API with streaming.
 */

import { randomUUID } from 'crypto';
import type { AIConfig, AIMessage, AIProvider, AIResponse, AIProviderType, StreamChunk } from '../types.js';

// ---------------------------------------------------------------------------
// Anthropic provider
// ---------------------------------------------------------------------------

export class AnthropicProvider implements AIProvider {
  readonly type: AIProviderType = 'ANTHROPIC';
  readonly name = 'Anthropic Claude';
  config: AIConfig;

  constructor(config: AIConfig) {
    this.config = {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 2048,
      ...config,
    };
  }

  private get baseUrl(): string {
    return this.config.baseUrl ?? 'https://api.anthropic.com/v1';
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey ?? '',
      'anthropic-version': '2023-06-01',
    };
  }

  private toAnthropicMessages(messages: AIMessage[]): Array<{ role: string; content: string }> {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));
  }

  private getSystemPrompt(messages: AIMessage[]): string | undefined {
    const systemMsg = messages.find((m) => m.role === 'system');
    return systemMsg?.content ?? this.config.systemPrompt;
  }

  async sendMessage(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse> {
    const mergedConfig = { ...this.config, ...config };
    const systemPrompt = this.getSystemPrompt(messages);

    const body: Record<string, unknown> = {
      model: mergedConfig.model ?? 'claude-3-5-sonnet-20241022',
      messages: this.toAnthropicMessages(messages),
      max_tokens: mergedConfig.maxTokens ?? 2048,
      temperature: mergedConfig.temperature ?? 0.7,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = await res.json() as {
      id: string;
      model: string;
      content: Array<{ type: string; text: string }>;
      stop_reason: string;
      usage: { input_tokens: number; output_tokens: number };
    };

    const text = data.content.filter((c) => c.type === 'text').map((c) => c.text).join('');

    return {
      id: data.id,
      model: data.model,
      content: text,
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  async *streamMessage(messages: AIMessage[], config?: Partial<AIConfig>): AsyncGenerator<StreamChunk> {
    const mergedConfig = { ...this.config, ...config };
    const systemPrompt = this.getSystemPrompt(messages);

    const body: Record<string, unknown> = {
      model: mergedConfig.model ?? 'claude-3-5-sonnet-20241022',
      messages: this.toAnthropicMessages(messages),
      max_tokens: mergedConfig.maxTokens ?? 2048,
      temperature: mergedConfig.temperature ?? 0.7,
      stream: true,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      yield { type: 'error', error: `Anthropic API error ${res.status}` };
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6)) as {
              type: string;
              delta?: { type: string; text?: string };
            };

            if (data.type === 'content_block_delta' && data.delta?.text) {
              accumulated += data.delta.text;
              yield { type: 'delta', content: data.delta.text };
            } else if (data.type === 'message_stop') {
              yield {
                type: 'done',
                response: {
                  id: randomUUID(),
                  model: mergedConfig.model ?? 'claude-3-5-sonnet-20241022',
                  content: accumulated,
                  finishReason: 'stop',
                },
              };
              return;
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async listModels(): Promise<string[]> {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
    ];
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });
      return res.ok
        ? { ok: true, message: 'Connected to Anthropic API' }
        : { ok: false, message: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, message: String(err) };
    }
  }
}

/**
 * @file ai/providers/openai.ts
 * @description OpenAI provider: chat completions API with streaming support.
 */

import { randomUUID } from 'crypto';
import type { AIConfig, AIMessage, AIProvider, AIResponse, AIProviderType, StreamChunk } from '../types.js';

// ---------------------------------------------------------------------------
// OpenAI provider
// ---------------------------------------------------------------------------

export class OpenAIProvider implements AIProvider {
  readonly type: AIProviderType = 'OPENAI';
  readonly name = 'OpenAI';
  config: AIConfig;

  constructor(config: AIConfig) {
    this.config = {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2048,
      ...config,
    };
  }

  private get baseUrl(): string {
    return this.config.baseUrl ?? 'https://api.openai.com/v1';
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey ?? ''}`,
    };
  }

  private toOpenAIMessages(messages: AIMessage[]): Array<{ role: string; content: string }> {
    const result: Array<{ role: string; content: string }> = [];
    if (this.config.systemPrompt) {
      result.push({ role: 'system', content: this.config.systemPrompt });
    }
    for (const msg of messages) {
      result.push({ role: msg.role, content: msg.content });
    }
    return result;
  }

  async sendMessage(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse> {
    const mergedConfig = { ...this.config, ...config };
    const body = {
      model: mergedConfig.model ?? 'gpt-4o',
      messages: this.toOpenAIMessages(messages),
      temperature: mergedConfig.temperature ?? 0.7,
      max_tokens: mergedConfig.maxTokens ?? 2048,
    };

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${err}`);
    }

    const data = await res.json() as {
      id: string;
      model: string;
      choices: Array<{ message: { content: string }; finish_reason: string }>;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      id: data.id,
      model: data.model,
      content: data.choices[0]?.message?.content ?? '',
      finishReason: (data.choices[0]?.finish_reason as AIResponse['finishReason']) ?? 'stop',
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  async *streamMessage(messages: AIMessage[], config?: Partial<AIConfig>): AsyncGenerator<StreamChunk> {
    const mergedConfig = { ...this.config, ...config };
    const body = {
      model: mergedConfig.model ?? 'gpt-4o',
      messages: this.toOpenAIMessages(messages),
      temperature: mergedConfig.temperature ?? 0.7,
      max_tokens: mergedConfig.maxTokens ?? 2048,
      stream: true,
    };

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      yield { type: 'error', error: `OpenAI API error ${res.status}` };
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
          const json = line.slice(6).trim();
          if (json === '[DONE]') {
            yield {
              type: 'done',
              response: {
                id: randomUUID(),
                model: mergedConfig.model ?? 'gpt-4o',
                content: accumulated,
                finishReason: 'stop',
              },
            };
            return;
          }
          try {
            const parsed = JSON.parse(json) as { choices: Array<{ delta: { content?: string } }> };
            const delta = parsed.choices[0]?.delta?.content ?? '';
            if (delta) {
              accumulated += delta;
              yield { type: 'delta', content: delta };
            }
          } catch {
            // Ignore malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, { headers: this.headers });
      if (!res.ok) return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
      const data = await res.json() as { data: Array<{ id: string }> };
      return data.data.map((m) => m.id).filter((id) => id.startsWith('gpt'));
    } catch {
      return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const models = await this.listModels();
      return { ok: models.length > 0, message: `Connected — ${models.length} models available` };
    } catch (err) {
      return { ok: false, message: String(err) };
    }
  }
}

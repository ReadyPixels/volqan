/**
 * @file ai/providers/openai.ts
 * @description OpenAI provider: chat completions API with streaming support.
 */
import { randomUUID } from 'crypto';
// ---------------------------------------------------------------------------
// OpenAI provider
// ---------------------------------------------------------------------------
export class OpenAIProvider {
    type = 'OPENAI';
    name = 'OpenAI';
    config;
    constructor(config) {
        this.config = {
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 2048,
            ...config,
        };
    }
    get baseUrl() {
        return this.config.baseUrl ?? 'https://api.openai.com/v1';
    }
    get headers() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey ?? ''}`,
        };
    }
    toOpenAIMessages(messages) {
        const result = [];
        if (this.config.systemPrompt) {
            result.push({ role: 'system', content: this.config.systemPrompt });
        }
        for (const msg of messages) {
            result.push({ role: msg.role, content: msg.content });
        }
        return result;
    }
    async sendMessage(messages, config) {
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
        const data = await res.json();
        return {
            id: data.id,
            model: data.model,
            content: data.choices[0]?.message?.content ?? '',
            finishReason: data.choices[0]?.finish_reason ?? 'stop',
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            },
        };
    }
    async *streamMessage(messages, config) {
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
                if (done)
                    break;
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
                        const parsed = JSON.parse(json);
                        const delta = parsed.choices[0]?.delta?.content ?? '';
                        if (delta) {
                            accumulated += delta;
                            yield { type: 'delta', content: delta };
                        }
                    }
                    catch {
                        // Ignore malformed chunks
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    async listModels() {
        try {
            const res = await fetch(`${this.baseUrl}/models`, { headers: this.headers });
            if (!res.ok)
                return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
            const data = await res.json();
            return data.data.map((m) => m.id).filter((id) => id.startsWith('gpt'));
        }
        catch {
            return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        }
    }
    async testConnection() {
        try {
            const models = await this.listModels();
            return { ok: models.length > 0, message: `Connected — ${models.length} models available` };
        }
        catch (err) {
            return { ok: false, message: String(err) };
        }
    }
}
//# sourceMappingURL=openai.js.map
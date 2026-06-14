/**
 * @file ai/providers/anthropic.ts
 * @description Anthropic Claude provider: messages API with streaming.
 */
import { randomUUID } from 'crypto';
// ---------------------------------------------------------------------------
// Anthropic provider
// ---------------------------------------------------------------------------
export class AnthropicProvider {
    type = 'ANTHROPIC';
    name = 'Anthropic Claude';
    config;
    constructor(config) {
        this.config = {
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.7,
            maxTokens: 2048,
            ...config,
        };
    }
    get baseUrl() {
        return this.config.baseUrl ?? 'https://api.anthropic.com/v1';
    }
    get headers() {
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey ?? '',
            'anthropic-version': '2023-06-01',
        };
    }
    toAnthropicMessages(messages) {
        return messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role, content: m.content }));
    }
    getSystemPrompt(messages) {
        const systemMsg = messages.find((m) => m.role === 'system');
        return systemMsg?.content ?? this.config.systemPrompt;
    }
    async sendMessage(messages, config) {
        const mergedConfig = { ...this.config, ...config };
        const systemPrompt = this.getSystemPrompt(messages);
        const body = {
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
        const data = await res.json();
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
    async *streamMessage(messages, config) {
        const mergedConfig = { ...this.config, ...config };
        const systemPrompt = this.getSystemPrompt(messages);
        const body = {
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
                if (done)
                    break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === 'content_block_delta' && data.delta?.text) {
                            accumulated += data.delta.text;
                            yield { type: 'delta', content: data.delta.text };
                        }
                        else if (data.type === 'message_stop') {
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
                    }
                    catch {
                        // Skip malformed chunks
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    async listModels() {
        return [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-opus-20240229',
            'claude-3-haiku-20240307',
        ];
    }
    async testConnection() {
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
        }
        catch (err) {
            return { ok: false, message: String(err) };
        }
    }
}
//# sourceMappingURL=anthropic.js.map
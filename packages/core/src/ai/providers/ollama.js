/**
 * @file ai/providers/ollama.ts
 * @description Ollama local provider: http://localhost:11434, model listing, streaming.
 */
import { randomUUID } from 'crypto';
// ---------------------------------------------------------------------------
// Ollama provider
// ---------------------------------------------------------------------------
export class OllamaProvider {
    type = 'OLLAMA';
    name = 'Ollama (Local)';
    config;
    constructor(config) {
        this.config = {
            model: 'llama3.2',
            temperature: 0.7,
            maxTokens: 2048,
            baseUrl: 'http://localhost:11434',
            ...config,
        };
    }
    get baseUrl() {
        return this.config.baseUrl ?? 'http://localhost:11434';
    }
    toOllamaMessages(messages) {
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
            model: mergedConfig.model ?? 'llama3.2',
            messages: this.toOllamaMessages(messages),
            stream: false,
            options: {
                temperature: mergedConfig.temperature ?? 0.7,
                num_predict: mergedConfig.maxTokens ?? 2048,
            },
        };
        const res = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Ollama error ${res.status}: ${err}`);
        }
        const data = await res.json();
        return {
            id: randomUUID(),
            model: data.model,
            content: data.message?.content ?? '',
            finishReason: 'stop',
            usage: data.prompt_eval_count !== undefined
                ? {
                    promptTokens: data.prompt_eval_count,
                    completionTokens: data.eval_count ?? 0,
                    totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
                }
                : undefined,
        };
    }
    async *streamMessage(messages, config) {
        const mergedConfig = { ...this.config, ...config };
        const model = mergedConfig.model ?? 'llama3.2';
        const body = {
            model,
            messages: this.toOllamaMessages(messages),
            stream: true,
            options: {
                temperature: mergedConfig.temperature ?? 0.7,
                num_predict: mergedConfig.maxTokens ?? 2048,
            },
        };
        let res;
        try {
            res = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        }
        catch {
            yield { type: 'error', error: 'Cannot connect to Ollama. Is it running on localhost:11434?' };
            return;
        }
        if (!res.ok || !res.body) {
            yield { type: 'error', error: `Ollama error ${res.status}` };
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
                const lines = chunk.split('\n').filter(Boolean);
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        const text = data.message?.content ?? '';
                        if (text) {
                            accumulated += text;
                            yield { type: 'delta', content: text };
                        }
                        if (data.done) {
                            yield {
                                type: 'done',
                                response: { id: randomUUID(), model, content: accumulated, finishReason: 'stop' },
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
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
            if (!res.ok)
                return [];
            const data = await res.json();
            return data.models.map((m) => m.name);
        }
        catch {
            return [];
        }
    }
    async testConnection() {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
            if (!res.ok)
                return { ok: false, message: `HTTP ${res.status}` };
            const models = await this.listModels();
            if (models.length === 0) {
                return { ok: true, message: 'Ollama connected but no models installed. Run `ollama pull llama3.2`.' };
            }
            return { ok: true, message: `Connected — ${models.length} model(s): ${models.slice(0, 3).join(', ')}` };
        }
        catch {
            return { ok: false, message: 'Ollama not running. Start with `ollama serve` and try again.' };
        }
    }
}
//# sourceMappingURL=ollama.js.map
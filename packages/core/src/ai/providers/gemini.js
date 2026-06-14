/**
 * @file ai/providers/gemini.ts
 * @description Google Gemini provider: generateContent API.
 */
import { randomUUID } from 'crypto';
// ---------------------------------------------------------------------------
// Gemini provider
// ---------------------------------------------------------------------------
export class GeminiProvider {
    type = 'GEMINI';
    name = 'Google Gemini';
    config;
    constructor(config) {
        this.config = {
            model: 'gemini-1.5-pro-latest',
            temperature: 0.7,
            maxTokens: 2048,
            ...config,
        };
    }
    get baseUrl() {
        return this.config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
    }
    toGeminiContents(messages) {
        const result = [];
        if (this.config.systemPrompt) {
            result.push({ role: 'user', parts: [{ text: `[System]: ${this.config.systemPrompt}` }] });
            result.push({ role: 'model', parts: [{ text: 'Understood.' }] });
        }
        for (const msg of messages) {
            if (msg.role === 'system')
                continue;
            result.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }
        return result;
    }
    async sendMessage(messages, config) {
        const mergedConfig = { ...this.config, ...config };
        const model = mergedConfig.model ?? 'gemini-1.5-pro-latest';
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${mergedConfig.apiKey ?? ''}`;
        const body = {
            contents: this.toGeminiContents(messages),
            generationConfig: {
                temperature: mergedConfig.temperature ?? 0.7,
                maxOutputTokens: mergedConfig.maxTokens ?? 2048,
            },
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Gemini API error ${res.status}: ${err}`);
        }
        const data = await res.json();
        const text = data.candidates[0]?.content.parts.map((p) => p.text).join('') ?? '';
        return {
            id: randomUUID(),
            model,
            content: text,
            finishReason: 'stop',
            usage: data.usageMetadata
                ? {
                    promptTokens: data.usageMetadata.promptTokenCount,
                    completionTokens: data.usageMetadata.candidatesTokenCount,
                    totalTokens: data.usageMetadata.totalTokenCount,
                }
                : undefined,
        };
    }
    async *streamMessage(messages, config) {
        const mergedConfig = { ...this.config, ...config };
        const model = mergedConfig.model ?? 'gemini-1.5-pro-latest';
        const url = `${this.baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${mergedConfig.apiKey ?? ''}`;
        const body = {
            contents: this.toGeminiContents(messages),
            generationConfig: {
                temperature: mergedConfig.temperature ?? 0.7,
                maxOutputTokens: mergedConfig.maxTokens ?? 2048,
            },
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok || !res.body) {
            yield { type: 'error', error: `Gemini API error ${res.status}` };
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
                        const text = data.candidates[0]?.content.parts.map((p) => p.text).join('') ?? '';
                        if (text) {
                            accumulated += text;
                            yield { type: 'delta', content: text };
                        }
                        if (data.candidates[0]?.finishReason === 'STOP') {
                            yield { type: 'done', response: { id: randomUUID(), model, content: accumulated, finishReason: 'stop' } };
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
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash-latest',
            'gemini-1.0-pro',
        ];
    }
    async testConnection() {
        try {
            const models = await this.listModels();
            return { ok: true, message: `Gemini available — ${models.length} models` };
        }
        catch (err) {
            return { ok: false, message: String(err) };
        }
    }
}
//# sourceMappingURL=gemini.js.map
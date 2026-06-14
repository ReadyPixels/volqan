/**
 * @file ai/manager.ts
 * @description AIManager: provider registry, switching, message dispatch.
 */
import { randomUUID } from 'crypto';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { GeminiProvider } from './providers/gemini.js';
import { OllamaProvider } from './providers/ollama.js';
// ---------------------------------------------------------------------------
// AIManager
// ---------------------------------------------------------------------------
export class AIManager {
    providers = new Map();
    activeProvider = null;
    constructor(options = {}) {
        if (options.providers) {
            for (const config of options.providers) {
                this.registerProvider(config);
            }
        }
        if (options.defaultProvider) {
            this.activeProvider = options.defaultProvider;
        }
    }
    // ---------------------------------------------------------------------------
    // Provider management
    // ---------------------------------------------------------------------------
    registerProvider(config) {
        const provider = this.createProvider(config);
        this.providers.set(config.provider, provider);
        if (!this.activeProvider) {
            this.activeProvider = config.provider;
        }
    }
    createProvider(config) {
        switch (config.provider) {
            case 'OPENAI':
                return new OpenAIProvider(config);
            case 'ANTHROPIC':
                return new AnthropicProvider(config);
            case 'GEMINI':
                return new GeminiProvider(config);
            case 'OLLAMA':
                return new OllamaProvider(config);
            default:
                throw new Error(`Unknown provider: ${config.provider}`);
        }
    }
    setActiveProvider(type) {
        if (!this.providers.has(type)) {
            throw new Error(`Provider ${type} is not registered`);
        }
        this.activeProvider = type;
    }
    getActiveProvider() {
        if (!this.activeProvider)
            return null;
        return this.providers.get(this.activeProvider) ?? null;
    }
    getProvider(type) {
        return this.providers.get(type) ?? null;
    }
    listRegisteredProviders() {
        return Array.from(this.providers.keys());
    }
    // ---------------------------------------------------------------------------
    // Message dispatch
    // ---------------------------------------------------------------------------
    async sendMessage(content, history = [], config) {
        const provider = this.getActiveProvider();
        if (!provider)
            throw new Error('No AI provider configured');
        const userMessage = {
            id: randomUUID(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        return provider.sendMessage([...history, userMessage], config);
    }
    async *streamMessage(content, history = [], config) {
        const provider = this.getActiveProvider();
        if (!provider) {
            yield { type: 'error', error: 'No AI provider configured' };
            return;
        }
        const userMessage = {
            id: randomUUID(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        yield* provider.streamMessage([...history, userMessage], config);
    }
    // ---------------------------------------------------------------------------
    // Provider utilities
    // ---------------------------------------------------------------------------
    async testConnection(type) {
        const provider = type
            ? this.providers.get(type)
            : this.getActiveProvider();
        if (!provider) {
            return { ok: false, message: 'No provider configured' };
        }
        return provider.testConnection();
    }
    async listModels(type) {
        const provider = type
            ? this.providers.get(type)
            : this.getActiveProvider();
        return provider?.listModels() ?? [];
    }
}
// ---------------------------------------------------------------------------
// Default singleton (configure via registerProvider)
// ---------------------------------------------------------------------------
export const aiManager = new AIManager();
//# sourceMappingURL=manager.js.map
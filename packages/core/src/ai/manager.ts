/**
 * @file ai/manager.ts
 * @description AIManager: provider registry, switching, message dispatch.
 */

import { randomUUID } from 'crypto';
import type {
  AIConfig,
  AIMessage,
  AIProvider,
  AIProviderType,
  AIResponse,
  AIManagerOptions,
  StreamChunk,
} from './types.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { GeminiProvider } from './providers/gemini.js';
import { OllamaProvider } from './providers/ollama.js';

// ---------------------------------------------------------------------------
// AIManager
// ---------------------------------------------------------------------------

export class AIManager {
  private providers = new Map<AIProviderType, AIProvider>();
  private activeProvider: AIProviderType | null = null;

  constructor(options: AIManagerOptions = {}) {
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

  registerProvider(config: AIConfig): void {
    const provider = this.createProvider(config);
    this.providers.set(config.provider, provider);

    if (!this.activeProvider) {
      this.activeProvider = config.provider;
    }
  }

  private createProvider(config: AIConfig): AIProvider {
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

  setActiveProvider(type: AIProviderType): void {
    if (!this.providers.has(type)) {
      throw new Error(`Provider ${type} is not registered`);
    }
    this.activeProvider = type;
  }

  getActiveProvider(): AIProvider | null {
    if (!this.activeProvider) return null;
    return this.providers.get(this.activeProvider) ?? null;
  }

  getProvider(type: AIProviderType): AIProvider | null {
    return this.providers.get(type) ?? null;
  }

  listRegisteredProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }

  // ---------------------------------------------------------------------------
  // Message dispatch
  // ---------------------------------------------------------------------------

  async sendMessage(
    content: string,
    history: AIMessage[] = [],
    config?: Partial<AIConfig>,
  ): Promise<AIResponse> {
    const provider = this.getActiveProvider();
    if (!provider) throw new Error('No AI provider configured');

    const userMessage: AIMessage = {
      id: randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    return provider.sendMessage([...history, userMessage], config);
  }

  async *streamMessage(
    content: string,
    history: AIMessage[] = [],
    config?: Partial<AIConfig>,
  ): AsyncGenerator<StreamChunk> {
    const provider = this.getActiveProvider();
    if (!provider) {
      yield { type: 'error', error: 'No AI provider configured' };
      return;
    }

    const userMessage: AIMessage = {
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

  async testConnection(type?: AIProviderType): Promise<{ ok: boolean; message: string }> {
    const provider = type
      ? this.providers.get(type)
      : this.getActiveProvider();

    if (!provider) {
      return { ok: false, message: 'No provider configured' };
    }

    return provider.testConnection();
  }

  async listModels(type?: AIProviderType): Promise<string[]> {
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

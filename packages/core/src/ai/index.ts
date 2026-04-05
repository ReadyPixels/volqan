/**
 * @file ai/index.ts
 * @description Barrel export for the AI module.
 */

export type {
  AIProviderType,
  AIConfig,
  AIRole,
  AIMessage,
  AIResponse,
  StreamChunk,
  AIProvider,
  AIManagerOptions,
} from './types.js';

export { OpenAIProvider } from './providers/openai.js';
export { AnthropicProvider } from './providers/anthropic.js';
export { GeminiProvider } from './providers/gemini.js';
export { OllamaProvider } from './providers/ollama.js';
export { AIManager, aiManager } from './manager.js';

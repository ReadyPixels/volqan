/**
 * @file ai/types.ts
 * @description AI integration type definitions.
 */

// ---------------------------------------------------------------------------
// Provider types
// ---------------------------------------------------------------------------

export type AIProviderType = 'OPENAI' | 'ANTHROPIC' | 'GEMINI' | 'OLLAMA';

export interface AIConfig {
  provider: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

export type AIRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  id: string;
  role: AIRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface AIResponse {
  id: string;
  model: string;
  content: string;
  finishReason: 'stop' | 'length' | 'error' | 'cancelled';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

export type StreamChunk = {
  type: 'delta';
  content: string;
} | {
  type: 'done';
  response: AIResponse;
} | {
  type: 'error';
  error: string;
};

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export interface AIProvider {
  type: AIProviderType;
  name: string;
  config: AIConfig;

  /**
   * Send a single-turn message and get a complete response.
   */
  sendMessage(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse>;

  /**
   * Stream a response via async generator.
   */
  streamMessage(
    messages: AIMessage[],
    config?: Partial<AIConfig>,
  ): AsyncGenerator<StreamChunk>;

  /**
   * List available models for this provider.
   */
  listModels(): Promise<string[]>;

  /**
   * Test the connection/API key.
   */
  testConnection(): Promise<{ ok: boolean; message: string }>;
}

// ---------------------------------------------------------------------------
// Manager types
// ---------------------------------------------------------------------------

export interface AIManagerOptions {
  defaultProvider?: AIProviderType;
  providers?: AIConfig[];
}

/**
 * @file ai/providers/ollama.ts
 * @description Ollama local provider: http://localhost:11434, model listing, streaming.
 */
import type { AIConfig, AIMessage, AIProvider, AIResponse, AIProviderType, StreamChunk } from '../types.js';
export declare class OllamaProvider implements AIProvider {
    readonly type: AIProviderType;
    readonly name = "Ollama (Local)";
    config: AIConfig;
    constructor(config: AIConfig);
    private get baseUrl();
    private toOllamaMessages;
    sendMessage(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse>;
    streamMessage(messages: AIMessage[], config?: Partial<AIConfig>): AsyncGenerator<StreamChunk>;
    listModels(): Promise<string[]>;
    testConnection(): Promise<{
        ok: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=ollama.d.ts.map
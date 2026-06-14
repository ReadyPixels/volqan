/**
 * @file ai/providers/openai.ts
 * @description OpenAI provider: chat completions API with streaming support.
 */
import type { AIConfig, AIMessage, AIProvider, AIResponse, AIProviderType, StreamChunk } from '../types.js';
export declare class OpenAIProvider implements AIProvider {
    readonly type: AIProviderType;
    readonly name = "OpenAI";
    config: AIConfig;
    constructor(config: AIConfig);
    private get baseUrl();
    private get headers();
    private toOpenAIMessages;
    sendMessage(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse>;
    streamMessage(messages: AIMessage[], config?: Partial<AIConfig>): AsyncGenerator<StreamChunk>;
    listModels(): Promise<string[]>;
    testConnection(): Promise<{
        ok: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=openai.d.ts.map
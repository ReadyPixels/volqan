/**
 * @file ai/providers/anthropic.ts
 * @description Anthropic Claude provider: messages API with streaming.
 */
import type { AIConfig, AIMessage, AIProvider, AIResponse, AIProviderType, StreamChunk } from '../types.js';
export declare class AnthropicProvider implements AIProvider {
    readonly type: AIProviderType;
    readonly name = "Anthropic Claude";
    config: AIConfig;
    constructor(config: AIConfig);
    private get baseUrl();
    private get headers();
    private toAnthropicMessages;
    private getSystemPrompt;
    sendMessage(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse>;
    streamMessage(messages: AIMessage[], config?: Partial<AIConfig>): AsyncGenerator<StreamChunk>;
    listModels(): Promise<string[]>;
    testConnection(): Promise<{
        ok: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=anthropic.d.ts.map
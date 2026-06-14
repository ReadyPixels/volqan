/**
 * @file ai/providers/gemini.ts
 * @description Google Gemini provider: generateContent API.
 */
import type { AIConfig, AIMessage, AIProvider, AIResponse, AIProviderType, StreamChunk } from '../types.js';
export declare class GeminiProvider implements AIProvider {
    readonly type: AIProviderType;
    readonly name = "Google Gemini";
    config: AIConfig;
    constructor(config: AIConfig);
    private get baseUrl();
    private toGeminiContents;
    sendMessage(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse>;
    streamMessage(messages: AIMessage[], config?: Partial<AIConfig>): AsyncGenerator<StreamChunk>;
    listModels(): Promise<string[]>;
    testConnection(): Promise<{
        ok: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=gemini.d.ts.map
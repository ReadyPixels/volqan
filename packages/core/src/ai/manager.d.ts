/**
 * @file ai/manager.ts
 * @description AIManager: provider registry, switching, message dispatch.
 */
import type { AIConfig, AIMessage, AIProvider, AIProviderType, AIResponse, AIManagerOptions, StreamChunk } from './types.js';
export declare class AIManager {
    private providers;
    private activeProvider;
    constructor(options?: AIManagerOptions);
    registerProvider(config: AIConfig): void;
    private createProvider;
    setActiveProvider(type: AIProviderType): void;
    getActiveProvider(): AIProvider | null;
    getProvider(type: AIProviderType): AIProvider | null;
    listRegisteredProviders(): AIProviderType[];
    sendMessage(content: string, history?: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse>;
    streamMessage(content: string, history?: AIMessage[], config?: Partial<AIConfig>): AsyncGenerator<StreamChunk>;
    testConnection(type?: AIProviderType): Promise<{
        ok: boolean;
        message: string;
    }>;
    listModels(type?: AIProviderType): Promise<string[]>;
}
export declare const aiManager: AIManager;
//# sourceMappingURL=manager.d.ts.map
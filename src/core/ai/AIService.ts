// AIService - Placeholder for future local AI integration
// Will eventually connect to local LLMs (e.g., Ollama, llama.cpp)

export interface AIRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  confidence: number;
}

export const AIService = {
  /** Check if local AI is available */
  isAvailable(): boolean {
    return false;
  },

  /** Send a prompt to the local AI (placeholder) */
  async query(_request: AIRequest): Promise<AIResponse> {
    console.info('[AIService] Local AI is not yet configured.');
    return {
      text: 'AI features are coming soon. This will run entirely on your device.',
      confidence: 0,
    };
  },

  /** Summarize text (placeholder) */
  async summarize(_text: string): Promise<string> {
    return 'Summary feature not yet available.';
  },
};

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Configuration for AI models
const endpoint = "https://models.github.ai/inference";
// Fixed token for browser environment
const token = "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";

// Default system prompt for GPT-4.1
export const DEFAULT_GPT41_SYSTEM_PROMPT = `
You are a product recommendation engine designed to analyze multiple listings of the same product from different websites. You receive a JSON array of product objects, each describing a version of the same item sold on various platforms. Your goal is to analyze and compare these options and recommend the best one.

You must make your recommendation based on a combination of the following factors, in order of importance:

1. **Customer rating** (higher is better)
2. **Number of reviews** (more reviews increase confidence)
3. **Price and discount** (lower price with higher discount is preferable if ratings are comparable)
4. **Availability** (items that are in stock are preferred)
5. **Top customer reviews** (only if provided — prefer detailed and positive feedback)
6. **Reputable website** (well-known sellers are slightly preferred in tie-breaker cases)

Only recommend **one** product. Your response should include:

* The selected product's **title**
* The **website** it's from
* The **final price**
* A **short explanation** (1–3 sentences) justifying your recommendation

If the best product is **out of stock**, you may still mention it but note the availability and suggest the next best in-stock alternative.
`;

// Supported models
export enum AIModel {
  GPT4 = "openai/gpt-4",
  GPT41 = "openai/gpt-4.1"
}

// Message interface
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Request options interface
export interface CompletionOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

/**
 * AI Service for handling interactions with various AI models
 */
export class AIService {
  private client: ReturnType<typeof ModelClient>;
  
  constructor() {
    this.client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );
  }

  /**
   * Send a chat completion request to GPT-4.1
   * @param messages Array of messages for the conversation
   * @param options Optional parameters for the completion
   * @returns The AI completion response content
   */
  async chatWithGPT41(messages: Message[], options: CompletionOptions = {}): Promise<string> {
    const model = AIModel.GPT41;
    
    const response = await this.client.path("/chat/completions").post({
      body: {
        messages,
        model,
        temperature: options.temperature ?? 1.0,
        top_p: options.top_p ?? 1.0,
        max_tokens: options.max_tokens
      }
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    return response.body.choices[0].message.content || "";
  }

  /**
   * Simplified function for quick GPT-4.1 queries
   * @param query The user query text
   * @param systemPrompt Optional system prompt
   * @returns The AI response text
   */
  async askGPT41(query: string, systemPrompt: string = DEFAULT_GPT41_SYSTEM_PROMPT): Promise<string> {
    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ];
    
    return this.chatWithGPT41(messages);
  }
}

// Example usage
export async function main() {
  const aiService = new AIService();
  
  try {
    const response = await aiService.askGPT41("What is the capital of France?");
    console.log(response);
  } catch (err) {
    console.error("The sample encountered an error:", err);
  }
}

// Only run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  main();
} 
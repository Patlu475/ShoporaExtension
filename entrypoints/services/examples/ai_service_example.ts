import { AIService, Message } from '../ai_service';

/**
 * Example demonstrating how to use the AIService with GPT-4.1
 */
async function demonstrateAIService() {
  // Initialize the AI service
  const aiService = new AIService();
  
  console.log("Example 1: Simple query with GPT-4.1");
  try {
    const response = await aiService.askGPT41(
      "What are the key differences between GPT-4 and GPT-4.1?"
    );
    console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }

  console.log("\nExample 2: Multi-turn conversation with GPT-4.1");
  try {
    const messages: Message[] = [
      { role: "system", content: "You are a product recommendation assistant for an e-commerce platform." },
      { role: "user", content: "I'm looking for a good laptop for video editing under $1500" }
    ];
    
    const response = await aiService.chatWithGPT41(messages);
    console.log("Response:", response);
    
    // Continue the conversation with a follow-up question
    messages.push({ role: "assistant", content: response });
    messages.push({ role: "user", content: "I also need it to have good battery life." });
    
    const followUpResponse = await aiService.chatWithGPT41(messages);
    console.log("Follow-up response:", followUpResponse);
  } catch (error) {
    console.error("Error:", error);
  }

  console.log("\nExample 3: Custom parameters with GPT-4.1");
  try {
    const response = await aiService.chatWithGPT41(
      [
        { role: "system", content: "You are a concise assistant that provides brief answers." },
        { role: "user", content: "Explain quantum computing" }
      ],
      {
        temperature: 0.7,
        max_tokens: 100
      }
    );
    console.log("Response with custom parameters:", response);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the examples
demonstrateAIService().catch(console.error); 
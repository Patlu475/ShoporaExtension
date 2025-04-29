// Import the AgentQL extraction function
import { extractProductWithAgentQL } from '../commands/extract_product.js';

/**
 * Message handler for extracting products with AgentQL
 */
export async function handleAgentQLExtraction(message, sender) {
  try {
    if (!message.url) {
      return { success: false, error: 'URL is required' };
    }
    
    const options = {
      includeAlternatives: message.includeAlternatives || false
    };
    
    // Extract product with AgentQL
    return await extractProductWithAgentQL(message.url, options);
  } catch (error) {
    console.error('Error handling AgentQL extraction message:', error);
    return {
      success: false,
      error: error.message || 'Failed to extract product with AgentQL'
    };
  }
} 
/**
 * Extract product information from a webpage using AgentQL
 */
export async function extractProductWithAgentQL(url, options = {}) {
  try {
    console.log(`Extracting product from ${url} with AgentQL`);
    
    // Default options
    const defaultOptions = {
      includeAlternatives: false
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // API endpoint for AgentQL extraction
    const API_ENDPOINT = 'http://127.0.0.1:5000/api/extract/agentql';
    
    // Prepare request payload
    const payload = {
      url,
      include_alternatives: mergedOptions.includeAlternatives
    };
    
    // Make API request
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AgentQL extraction failed: ${errorData.error || response.statusText}`);
    }
    
    // Parse response
    const result = await response.json();
    
    // Log the result for debugging
    console.log('AgentQL extraction result:', result);
    
    return result;
  } catch (error) {
    console.error('Error extracting product with AgentQL:', error);
    return {
      success: false,
      error: error.message || 'Failed to extract product information'
    };
  }
} 
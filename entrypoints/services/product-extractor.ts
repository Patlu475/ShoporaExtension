/**
 * Product extraction strategy types
 */
export enum ExtractionStrategy {
  LLM = 'llm',
  OpenAI = 'openai',
  AgentQL = 'agentql'
}

/**
 * Product data interface
 */
export interface Product {
  title: string;
  description: string;
  price: string;
  image: string;
  website: string;
  availability?: string; // Product availability status (In Stock, Out of Stock, etc.)
}

/**
 * Response from the crawler API
 */
interface CrawlerResponse {
  success: boolean;
  data?: Product[] | Product;
  error?: string;
}

/**
 * Product Extractor Service - Communicates with Python Crawler API
 */
export class ProductExtractorService {
  private apiUrl: string;
  
  constructor(apiUrl: string = 'http://127.0.0.1:5000') {
    this.apiUrl = apiUrl;
  }

  /**
   * Get the API URL
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Check if the API server is running
   */
  async isServerRunning(): Promise<boolean> {
    try {
      console.log(`[DEBUG] Checking if API server is running at ${this.apiUrl}`);
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`[DEBUG] Health check response status:`, response.status);
      return response.ok;
    } catch (error) {
      console.error('[DEBUG] API server health check failed:', error);
      return false;
    }
  }

  /**
   * Extract products from a URL using the crawler API
   * API key is now managed server-side via .env file
   */
  async extractProducts(url: string, strategy: ExtractionStrategy = ExtractionStrategy.AgentQL): Promise<any> {
    try {
      console.log(`[DEBUG] Extracting products from ${url} using strategy: ${strategy}`);
      
      // Check if the server is running first
      const isRunning = await this.isServerRunning();
      if (!isRunning) {
        console.error('[DEBUG] API server is not running');
        return {
          success: false,
          error: 'API server is not running. Please start the Python API server with `python start_crawler_server.py`',
          mockData: true,
          data: { 
            title: "Sample Product (Mock Data - Server Not Running)",
            description: "The Python API server is not running. Please start it with `python start_crawler_server.py`",
            price: "$99.99",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
            website: "example.com"
          }
        };
      }
      
      // Choose the appropriate API endpoint based on the strategy
      let apiEndpoint = `${this.apiUrl}/api/crawl`;
      let payload: any = { url };
      
      if (strategy === ExtractionStrategy.AgentQL) {
        console.log(`[DEBUG] Using AgentQL extraction strategy`);
        apiEndpoint = `${this.apiUrl}/api/extract/agentql`;
        payload = { 
          url, 
          include_alternatives: true
        };
      } else {
        console.log(`[DEBUG] Using OpenAI/default extraction strategy`);
      }
      
      // First try connecting to the API
      try {
        console.log(`[DEBUG] Calling API at ${apiEndpoint}`);
        const requestPayload = JSON.stringify(payload);
        console.log(`[DEBUG] Request payload:`, requestPayload);
        
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: requestPayload
        });
        
        console.log(`[DEBUG] API response status:`, response.status);
        
        if (!response.ok) {
          console.error(`[DEBUG] API error response:`, response);
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data: CrawlerResponse = await response.json();
        console.log('[DEBUG] API Response JSON:', data);
        
        if (data.success && data.data) {
          // Make sure we have a single product, not an array
          let productData: Record<string, any> = 
            Array.isArray(data.data) ? data.data[0] : data.data;
          
          console.log('[DEBUG] Raw productData before processing:', productData);
          
          // Handle the case where productData might be null, undefined, or not an object
          if (!productData || typeof productData !== 'object') {
            console.error('[DEBUG] Invalid product data format received:', productData);
            
            // Create a minimal product with error information
            return {
              success: true,
              data: {
                title: "Could not extract product details",
                description: "The API returned a response, but the product data format was invalid. This might indicate an issue with the extraction process.",
                price: "Unknown",
                image: "",
                website: new URL(url).hostname
              }
            };
          }
          
          // Make a clean product object with the correct fields
          const cleanProduct: Product = {
            title: '',
            description: '',
            price: '',
            image: '',
            website: ''
          };
          
          // Copy all existing fields
          if (productData) {
            console.log('[DEBUG] Processing product data:', productData);
            
            // Map name to title if needed
            if ('name' in productData && typeof productData.name === 'string') {
              cleanProduct.title = productData.name;
            }
            
            // Map all other fields
            if ('title' in productData && typeof productData.title === 'string') {
              cleanProduct.title = productData.title;
            }
            
            if ('description' in productData && typeof productData.description === 'string') {
              cleanProduct.description = productData.description;
            }
            
            if ('price' in productData && typeof productData.price === 'string') {
              cleanProduct.price = productData.price;
            }
            
            if ('image' in productData && typeof productData.image === 'string') {
              cleanProduct.image = productData.image;
            }
            
            if ('website' in productData && typeof productData.website === 'string') {
              cleanProduct.website = productData.website;
            }
            
            // If price is empty, try to extract from other fields
            if (!cleanProduct.price) {
              // Look for price-related fields
              for (const [key, value] of Object.entries(productData)) {
                if (key.toLowerCase().includes('price') && typeof value === 'string' && value) {
                  cleanProduct.price = value;
                  console.log(`[DEBUG] Found price in field '${key}': ${value}`);
                  break;
                }
              }
            }
            
            // If website is empty, try to extract from URL
            if (!cleanProduct.website && typeof url === 'string') {
              try {
                const urlObj = new URL(url);
                cleanProduct.website = urlObj.hostname;
                console.log(`[DEBUG] Set website from URL: ${cleanProduct.website}`);
              } catch (e) {
                console.error('[DEBUG] Failed to parse URL for website field', e);
              }
            }
          }
          
          console.log('[DEBUG] Formatted product data:', cleanProduct);
          
          // Format the response to maintain backward compatibility
          const successResponse = {
            success: true,
            data: cleanProduct  // Return the clean product directly without nesting
          };
          
          console.log('[DEBUG] Returning success response:', successResponse);
          return successResponse;
        }
        
        console.error('[DEBUG] API error:', data.error || 'Unknown error from crawler API');
        throw new Error(data.error || 'Unknown error from crawler API');
      } catch (error) {
        console.error('[DEBUG] Failed to use crawler API, falling back to mock data:', error);
        
        // Fallback to mock data if API fails (for development)
        const mockResponse = {
          success: true,
          mockData: true, // Flag to indicate this is mock data
          data: { 
            title: "Sample Product (Mock Data)",
            description: "This is a sample product description. The crawler API could not be reached, so mock data is being shown.",
            price: "$99.99",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
            website: "example.com"
          }
        };
        
        console.log('[DEBUG] Returning mock data response:', mockResponse);
        return mockResponse;
      }
    } catch (error) {
      console.error('[DEBUG] Error in product extraction:', error);
      const errorResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during extraction'
      };
      console.log('[DEBUG] Returning error response:', errorResponse);
      return errorResponse;
    }
  }
}

// Singleton instance
export const productExtractorService = new ProductExtractorService(); 
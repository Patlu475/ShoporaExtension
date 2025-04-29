// ShopBot Content Script
// This script is injected into web pages to extract product information
import browser from 'webextension-polyfill';
import { ExtractionStrategy, productExtractorService, Product } from './services/product-extractor';
import { defineContentScript } from 'wxt/sandbox';

// Types
interface CrawlResponse {
  success?: boolean;
  data?: any;
  error?: string;
  mockData?: boolean;
}

interface CrawlPageMessage {
  action: 'crawlPage';
  url?: string;
  strategy?: ExtractionStrategy;
}

// Logger utility
const Logger = {
  log: (message: string, ...args: any[]) => console.log('[SHOPBOT]', message, ...args),
  debug: (message: string, ...args: any[]) => console.log('[DEBUG]', message, ...args),
  error: (message: string, ...args: any[]) => console.error('[SHOPBOT]', message, ...args)
};

// Type guards
function isCrawlPageMessage(message: unknown): message is CrawlPageMessage {
  return typeof message === 'object' && 
         message !== null && 
         'action' in message && 
         message.action === 'crawlPage';
}

// UI Manager - Handles all UI-related functionality
const UIManager = {
  createUI() {
    Logger.log('Creating UI');
    
    // Create ShopBot container
    const container = this.createContainer();
    
    // Add ShopBot content area
    const content = this.createContent(container);
    
    // Add styles
    this.addStyles();
    
    Logger.log('UI created successfully');
  },
  
  createContainer() {
    Logger.log('Creating container');
    
    // Check if container already exists
    let container = document.getElementById('shopbot-container');
    if (container) {
      Logger.log('Container already exists');
      return container;
    }
    
    // Create new container
    container = document.createElement('div');
    container.id = 'shopbot-container';
    container.className = 'shopbot-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'shopbot-header';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = '🛍️ ShopBot';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'shopbot-close';
    closeButton.addEventListener('click', () => {
      container.style.display = 'none';
    });
    
    // Assemble header
    header.appendChild(title);
    header.appendChild(closeButton);
    container.appendChild(header);
    
    // Add to DOM
    document.body.appendChild(container);
    Logger.log('Container added to document body');
    
    return container;
  },
  
  createContent(container: HTMLElement) {
    Logger.log('Creating content');
    
    // Check if content already exists
    let content = document.getElementById('shopbot-content');
    if (content) {
      Logger.log('Content already exists');
      return content;
    }
    
    // Create content
    content = document.createElement('div');
    content.id = 'shopbot-content';
    content.className = 'shopbot-content';
    container.appendChild(content);
    Logger.log('Content added to container');
    
    return content;
  },
  
  createDebugAlert() {
    const debugAlert = document.createElement('div');
    debugAlert.textContent = 'ShopBot Content Script Loaded Successfully!';
    debugAlert.style.position = 'fixed';
    debugAlert.style.top = '10px';
    debugAlert.style.left = '10px';
    debugAlert.style.padding = '10px';
    debugAlert.style.backgroundColor = 'red';
    debugAlert.style.color = 'white';
    debugAlert.style.zIndex = '10000';
    debugAlert.style.borderRadius = '5px';
    document.body.appendChild(debugAlert);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (debugAlert.parentNode) {
        debugAlert.parentNode.removeChild(debugAlert);
      }
    }, 5000);
  },
  
  showLoading(contentElement: HTMLElement) {
  contentElement.innerHTML = `
    <div class="shopbot-loading">
      <div class="shopbot-spinner"></div>
      <div>Scanning for products...</div>
    </div>
  `;
  },
  
  showError(contentElement: HTMLElement, error: string | Error) {
    const errorMessage = error instanceof Error ? error.message : error;
    contentElement.innerHTML = `
      <div class="shopbot-error">
        <p>Error: ${errorMessage}</p>
      </div>
    `;
  },
  
  addStyles() {
    Logger.log('Adding styles');
    
    // Skip if styles already exist
  if (document.getElementById('shopbot-styles')) {
      Logger.log('Styles already exist');
    return;
  }
  
  const styles = `
    .shopbot-container {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      max-height: 100vh;
      background-color: white;
      z-index: 10000;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
      overflow-y: auto;
      display: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .shopbot-header {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #2c3e50;
      color: white;
    }
    
    .shopbot-content {
      padding: 15px;
    }
    
    .shopbot-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .shopbot-spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #2c3e50;
      animation: spinner 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .shopbot-error {
      color: #721c24;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .shopbot-warning {
      color: #856404;
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .shopbot-success {
      color: #155724;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .shopbot-button {
      background-color: #2c3e50;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
    }
    
    .shopbot-button:hover {
      background-color: #1e2b38;
    }
    
    .shopbot-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
    
    .product-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      overflow: hidden;
    }
    
    .product-header {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .product-title {
      margin: 0 0 10px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .product-meta {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    
    .product-price {
      color: #4caf50;
      font-weight: bold;
    }
    
    .product-website {
      color: #666;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .product-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-description {
      padding: 15px;
      font-size: 14px;
      line-height: 1.5;
      color: #555;
    }
    
    .no-products {
      text-align: center;
      padding: 20px;
      color: #666;
    }
    
    .product-availability {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .product-availability:not(:empty) {
      background-color: #e2e8f0;
      color: #4a5568;
    }
    
    .product-availability:contains("In Stock") {
      background-color: #c6f6d5;
      color: #22543d;
    }
    
    .product-availability:contains("Out of Stock"), 
    .product-availability:contains("Sold Out") {
      background-color: #fed7d7;
      color: #822727;
    }
  `;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'shopbot-styles';
  styleElement.textContent = styles;
  
  try {
    document.head.appendChild(styleElement);
      Logger.log('Styles added to document head');
    } catch (error) {
      Logger.error('Error adding styles:', error);
    }
  }
};

// API Communication Manager - Handles communication with background script
const ApiManager = {
  sendMessageToBackground(message: any, timeoutMs = 120000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.error('[DEBUG] Message timeout after', timeoutMs, 'ms');
        reject(new Error(`Message timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      Logger.debug('Sending message with custom handler:', message);
      
      try {
        browser.runtime.sendMessage(message)
          .then((response) => {
            clearTimeout(timeoutId);
            Logger.debug('Received response in custom handler:', response);
            resolve(response);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            Logger.error('Error in custom handler:', error);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeoutId);
        Logger.error('Exception in sendMessage:', error);
        reject(error);
      }
    });
  },
  
  async checkServerStatus(): Promise<boolean> {
    try {
      Logger.debug('Checking server status');
      const serverUrl = 'http://127.0.0.1:5000/health';
      const response = await fetch(serverUrl, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      Logger.error('Error checking server status:', error);
      return false;
    }
  }
};

// Product Manager - Handles product extraction and display
const ProductManager = {
  async extractProductsFromPage(contentElement: HTMLElement, containerElement: HTMLElement): Promise<CrawlResponse> {
    Logger.log('extractProductsFromPage called');

    // Show container
    containerElement.style.display = 'block';
    
    // Show loading
    UIManager.showLoading(contentElement);
    
    try {
      // Get current URL
      const currentUrl = window.location.href;
      Logger.debug("Extracting products for URL:", currentUrl);
      
      // Handle test URLs
      if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
        Logger.log('Test URL detected, using mock product data');
        
        // Create test product
        const testProduct = {
          title: "Test Product",
          description: "This is a test product from the test page. If you see this, the extraction and display functions are working!",
          price: "$99.99",
          image: "https://via.placeholder.com/300",
          website: "example.com"
        };
        
        // Display the test product
        this.displayProducts(contentElement, [testProduct]);
        
        return {
          success: true,
          mockData: true,
          data: testProduct
        };
      }
      
      // Send message to background script
      Logger.debug("Sending message to background script...");
      
      const message = {
        action: 'crawlPage',
        url: currentUrl,
        strategy: ExtractionStrategy.LLM
      };
      
      // Send message to background and await response
      let response = null;
      
      try {
        response = await ApiManager.sendMessageToBackground(message) as CrawlResponse;
        Logger.debug("RECEIVED RESPONSE FROM BACKGROUND:", response);
      } catch (error) {
        Logger.error("Error from message sender:", error);
        throw error;
      }
      
      if (!response) {
        throw new Error("Received null response from background script");
      }
      
      return this.handleExtractionResponse(response, contentElement, containerElement);
    } catch (error) {
      Logger.error('Error extracting products:', error);
      
      UIManager.showError(
        contentElement, 
        `${error instanceof Error ? error.message : 'An unknown error occurred.'} This might be caused by the Python API server not running.`
      );
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred in content script'
      };
    }
  },
  
  handleExtractionResponse(
    response: CrawlResponse, 
    contentElement: HTMLElement, 
    containerElement: HTMLElement
  ): CrawlResponse {
    // Handle mock data (server not running)
    if (response.success && response.mockData) {
      this.handleMockDataResponse(response, contentElement);
      return response;
    }
    
    // Handle successful extraction
    if (response.success) {
      this.handleSuccessResponse(response, contentElement);
      return response;
    }
    
    // Handle error
    this.handleErrorResponse(response, contentElement, containerElement);
    return response;
  },
  
  handleMockDataResponse(response: CrawlResponse, contentElement: HTMLElement) {
    contentElement.innerHTML = `
      <div class="shopbot-warning">
        <p>⚠️ <strong>API Server Connection Issue</strong></p>
        <p>Could not connect to the extraction API server. Please make sure:</p>
        <ol>
          <li>The Python API server is running (<code>python start_crawler_server.py</code>)</li>
          <li>Your OpenAI API key is correctly set in the .env file</li>
          <li>The server is accessible at http://127.0.0.1:5000</li>
        </ol>
        <p>Showing mock data instead:</p>
      </div>
    `;
    
    // Show mock data after warning
    setTimeout(() => {
      const mockProduct = response.data ? [response.data] : [];
      this.displayProducts(contentElement, mockProduct);
    }, 500);
  },
  
  handleSuccessResponse(response: CrawlResponse, contentElement: HTMLElement) {
    Logger.debug("Success response, data:", response.data);
    
    let products = [];
    
    // Process different data structures
    if (response.data) {
      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        products = response.data.products;
      } else if (typeof response.data === 'object') {
        products = [response.data];
      }
    }
    
    // Check if we have products
    if (products.length === 0) {
      Logger.error("No products found in response data");
      contentElement.innerHTML = `
        <div class="shopbot-error">
          <p>No valid products found in the API response.</p>
          <p>Raw data received: ${JSON.stringify(response.data)}</p>
        </div>
      `;
      return;
    }
    
    // Display products
    this.displayProducts(contentElement, products);
  },
  
  handleErrorResponse(
    response: CrawlResponse, 
    contentElement: HTMLElement, 
    containerElement: HTMLElement
  ) {
    Logger.error("Error in API response:", response.error);
    
    contentElement.innerHTML = `
      <div class="shopbot-error">
        <p>Error: ${response.error || 'Failed to extract products. Please check your API key in settings.'}</p>
        <p>Make sure your Python API server is running and your OpenAI API key is correctly set in the .env file.</p>
        <button id="shopbot-check-server" class="shopbot-button">Check Server Status</button>
      </div>
    `;
    
    // Add event listener for server check
    this.setupServerCheckButton(contentElement, containerElement);
  },
  
  setupServerCheckButton(contentElement: HTMLElement, containerElement: HTMLElement) {
    document.getElementById('shopbot-check-server')?.addEventListener('click', async () => {
      UIManager.showLoading(contentElement);
      
      try {
        const isServerRunning = await ApiManager.checkServerStatus();
        
        if (isServerRunning) {
          contentElement.innerHTML = `
            <div class="shopbot-success">
              <p>✅ API Server is running!</p>
              <p>Try again to extract products:</p>
              <button id="shopbot-retry" class="shopbot-button">Retry Extraction</button>
            </div>
          `;
          
          // Add retry listener
          document.getElementById('shopbot-retry')?.addEventListener('click', () => {
            this.extractProductsFromPage(contentElement, containerElement);
          });
        } else {
          contentElement.innerHTML = `
            <div class="shopbot-error">
              <p>❌ API Server is not running or not accessible.</p>
              <p>Please start the Python API server with:</p>
              <pre>python start_crawler_server.py</pre>
              <p>Make sure:</p>
              <ol>
                <li>You have installed all required Python packages</li>
                <li>Your OpenAI API key is set in the .env file</li>
                <li>The server is configured to run on http://127.0.0.1:5000</li>
              </ol>
            </div>
          `;
        }
      } catch (error) {
        UIManager.showError(contentElement, `Error checking server status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  },

  displayProducts(contentElement: HTMLElement, products: any[]) {
    Logger.log('displayProducts called');

    // Check content element
    if (!contentElement || !(contentElement instanceof HTMLElement)) {
      Logger.error('Invalid content element provided to displayProducts');
      return;
    }

    // Clear existing content
    contentElement.innerHTML = '';
    
    // Handle no products
    if (!products || products.length === 0) {
      contentElement.innerHTML = '<p class="no-products">No products found on this page.</p>';
      return;
    }
    
    // Log product data
    Logger.debug('Products to display:', products);
    
    // Render each product
    products.forEach((product, index) => {
      if (!product) {
        Logger.error('Product is null or undefined');
        return;
      }
      
      try {
        // Extract fields with fallbacks
        const title = product.title || 'Unknown Product';
        const description = product.description || 'No description available';
        const price = product.price || 'Price not available';
        const website = product.website || 'Website not available';
        const image = product.image || '';
        const availability = product.availability || '';
        
        // Create product HTML
        const productHTML = `
          <div class="product-card">
            <div class="product-header">
              <h3 class="product-title">${title}</h3>
              <div class="product-meta">
                <span class="product-price">${price}</span>
                <span class="product-website">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  ${website}
                </span>
              </div>
              ${availability ? `<div class="product-availability">${availability}</div>` : ''}
            </div>
            ${image ? `
              <div class="product-image">
                <img src="${image}" alt="${title}" />
              </div>
            ` : ''}
            <div class="product-description">
              ${description}
            </div>
          </div>
        `;
        
        // Add to content
        contentElement.innerHTML += productHTML;
  } catch (error) {
        Logger.error('Error rendering product HTML:', error);
        contentElement.innerHTML += `
          <div class="shopbot-error">
            <p>Error rendering product: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        `;
      }
    });
    
    // Ensure styles are applied
    UIManager.addStyles();
  }
};

// Message handling for content script
function setupMessageListener() {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    Logger.log('Received message:', message);
    
    if (isCrawlPageMessage(message)) {
      Logger.log('Handling crawlPage request from popup');
      
      // Get UI elements
      const containerElement = document.getElementById('shopbot-container');
      const contentElement = document.getElementById('shopbot-content');
      
      if (!containerElement || !contentElement) {
        Logger.error('Required elements not found for extraction');
        sendResponse({
          success: false,
          error: 'Required UI elements not found. Please try reloading the page.'
        });
        return true;
      }
      
      // Handle extraction asynchronously
      ProductManager.extractProductsFromPage(contentElement, containerElement)
        .then(result => {
          Logger.log('Extraction completed, sending response to popup:', result);
          sendResponse(result);
        })
        .catch(error => {
          Logger.error('Error during extraction:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error in content script'
          });
        });
      
      // Return true to indicate we'll respond asynchronously
      return true;
    } else if (message && typeof message === 'object' && 'action' in message && message.action === 'renderProductScanner') {
      // This is a message from the background script to load and render the ProductScanner component
      Logger.log('Rendering ProductScanner component');
      
      try {
        // Create a stylesheet link for the ProductScanner component
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = browser.runtime.getURL('product-scanner.css');
        document.head.appendChild(styleLink);
        
        // Create a script tag to load the ProductScanner component
        const script = document.createElement('script');
        script.src = browser.runtime.getURL('product-scanner.js');
        script.type = 'text/javascript';
        script.onload = () => {
          Logger.log('ProductScanner script loaded');
          // Try to execute the render function if it exists
          if (window.renderShopbotProductScanner && typeof window.renderShopbotProductScanner === 'function') {
            window.renderShopbotProductScanner();
          } else {
            Logger.error('renderShopbotProductScanner function not found');
          }
        };
        script.onerror = (e) => {
          Logger.error('Failed to load ProductScanner script:', e);
        };
        document.body.appendChild(script);
        
        sendResponse({ success: true });
      } catch (error) {
        Logger.error('Error rendering ProductScanner:', error);
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error rendering ProductScanner' 
        });
      }
      
      return true;
    }
    
    // Return true for all messages to keep the channel open
    return true;
  });
}

// Add the necessary code to inject our product-scanner component
async function injectProductScanner() {
  Logger.log('Injecting ProductScanner component');
  
  try {
    // Check authentication status first
    Logger.log('Checking authentication status before injection');
    
    // Send a message to the background script to check if the user is logged in
    const authResponse = await chrome.runtime.sendMessage({
      action: 'checkAuthStatus'
    });
    
    Logger.log('Auth status response:', authResponse);
    
    // Only proceed if the user is authenticated
    if (!authResponse?.success || !authResponse?.data?.isAuthenticated) {
      Logger.log('User not authenticated. Not injecting ProductScanner.');
      return;
    }
    
    Logger.log('User authenticated. Proceeding with ProductScanner injection.');
    
    // First, create a container for the React component
    const scannerContainer = document.createElement('div');
    scannerContainer.id = 'shopbot-product-scanner-container';
    scannerContainer.style.position = 'fixed';
    scannerContainer.style.bottom = '20px';
    scannerContainer.style.right = '20px';
    scannerContainer.style.zIndex = '9999';
    document.body.appendChild(scannerContainer);
    
    // Create and append a Shadow DOM to isolate our styles
    const shadowRoot = scannerContainer.attachShadow({ mode: 'open' });
    
    // Create a container inside the shadow DOM
    const shadowContainer = document.createElement('div');
    shadowContainer.id = 'shopbot-shadow-container';
    shadowRoot.appendChild(shadowContainer);
    
    // Create placeholder styled button until the React component loads
    const placeholderButton = document.createElement('button');
    placeholderButton.textContent = 'Find Similar Products';
    placeholderButton.style.backgroundColor = '#4F46E5';
    placeholderButton.style.color = 'white';
    placeholderButton.style.border = 'none';
    placeholderButton.style.borderRadius = '9999px';
    placeholderButton.style.padding = '12px 16px';
    placeholderButton.style.cursor = 'pointer';
    placeholderButton.style.fontWeight = '500';
    placeholderButton.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    placeholderButton.style.display = 'flex';
    placeholderButton.style.alignItems = 'center';
    placeholderButton.style.gap = '8px';
    placeholderButton.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif';
    shadowContainer.appendChild(placeholderButton);
    
    // Add click handler for the placeholder
    placeholderButton.addEventListener('click', () => {
      Logger.log('Placeholder button clicked');
      
      // Show container
      const containerElement = document.getElementById('shopbot-container');
      const contentElement = document.getElementById('shopbot-content');
      
      if (!containerElement || !contentElement) {
        Logger.error('Required elements not found for extraction');
        return;
      }
      
      // Handle extraction
      ProductManager.extractProductsFromPage(contentElement, containerElement)
        .catch(error => {
          Logger.error('Error during extraction:', error);
        });
    });
    
    // Prepare to inject the React component using Web Extension Messaging
    Logger.log('Requesting ProductScanner component injection via background script');
    
    // Create styles for React component
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      /* Reset some styles for the component */
      #shopbot-shadow-container * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      /* Floating button styles */
      .product-scanner-button {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: linear-gradient(to right, #4F46E5, #7C3AED);
        color: white;
        border: none;
        border-radius: 9999px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 0.2s ease;
      }
      
      .product-scanner-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      
      /* Animation for the shine effect */
      @keyframes shine {
        0% {
          transform: translateX(-100%) skewX(15deg);
        }
        100% {
          transform: translateX(200%) skewX(15deg);
        }
      }
      
      .shine-effect {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to right,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.2) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        transform: translateX(-100%) skewX(15deg);
        animation: shine 4s infinite;
      }
    `;
    shadowRoot.appendChild(styleTag);
    
    // Replace placeholder with a better styled button
    setTimeout(() => {
      shadowContainer.removeChild(placeholderButton);
      
      const betterButton = document.createElement('button');
      betterButton.className = 'product-scanner-button';
      betterButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L14.5 8.5L20 9.5L16 14L17 19.5L12 17L7 19.5L8 14L4 9.5L9.5 8.5L12 3Z" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Find Similar Products</span>
        <div class="shine-effect"></div>
      `;
      
      // Update button style to black
      betterButton.style.background = 'linear-gradient(to right, #000000, #333333)';
      
      // Add click handler
      betterButton.addEventListener('click', async () => {
        Logger.log('ProductScanner button clicked');
        
        // Create a popup container if it doesn't exist
        let popupContainer = document.getElementById('shopbot-scanner-popup');
        if (!popupContainer) {
          popupContainer = document.createElement('div');
          popupContainer.id = 'shopbot-scanner-popup';
          shadowRoot.appendChild(popupContainer);
          
          // Add styles for the popup with improved typography
          const popupStyles = document.createElement('style');
          popupStyles.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            #shopbot-scanner-popup {
              position: fixed;
              bottom: 80px;
              right: 20px;
              width: 350px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              overflow: hidden;
              z-index: 9999;
              animation: slideIn 0.3s ease-out forwards;
            }
            
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .popup-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px;
              background: #000000;
              color: white;
            }
            
            .popup-header h3 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              letter-spacing: -0.025em;
            }
            
            .popup-close {
              background: none;
              border: none;
              color: white;
              font-size: 18px;
              cursor: pointer;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              opacity: 0.8;
              transition: opacity 0.2s;
            }
            
            .popup-close:hover {
              opacity: 1;
            }
            
            .popup-content {
              padding: 20px;
              max-height: 60vh;
              overflow-y: auto;
            }
            
            .product-card {
              overflow: hidden;
            }
            
            .product-header {
              margin-bottom: 16px;
            }
            
            .product-title {
              margin: 0 0 12px 0;
              font-size: 18px;
              font-weight: 600;
              letter-spacing: -0.025em;
              line-height: 1.4;
              color: #171717;
            }
            
            .product-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            
            .product-price {
              font-weight: 700;
              font-size: 18px;
              color: #000000;
            }
            
            .product-website {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            
            .product-website svg {
              width: 14px;
              height: 14px;
            }
            
            .product-image {
              width: 100%;
              height: 200px;
              background-position: center;
              background-size: cover;
              border-radius: 8px;
              margin-bottom: 16px;
            }
            
            .product-description {
              font-size: 14px;
              color: #4b5563;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            
            .product-footer {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            
            .product-action {
              padding: 10px 14px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .product-action.primary {
              background: #000000;
              color: white;
              border: none;
            }
            
            .product-action.primary:hover {
              background: #333333;
            }
            
            .product-action.secondary {
              background: white;
              color: #000000;
              border: 1px solid #e5e7eb;
            }
            
            .product-action.secondary:hover {
              background: #f9fafb;
            }
            
            .product-badge {
              display: inline-flex;
              align-items: center;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              margin-right: 6px;
            }
            
            .badge-instock {
              background: #ecfdf5;
              color: #065f46;
            }
            
            .badge-outofstock {
              background: #fef2f2;
              color: #b91c1c;
            }
            
            .badge-category {
              background: #f3f4f6;
              color: #374151;
            }
            
            .product-rating {
              display: flex;
              align-items: center;
              gap: 4px;
              margin-top: 12px;
              margin-bottom: 16px;
            }
            
            .product-rating-stars {
              color: #facc15;
            }
            
            .product-rating-count {
              color: #64748b;
              font-size: 14px;
            }
            
            /* Loading spinner styles */
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px 20px;
              text-align: center;
            }
            
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 3px solid rgba(0, 0, 0, 0.1);
              border-radius: 50%;
              border-top-color: #000;
              animation: spin 1s ease-in-out infinite;
              margin-bottom: 16px;
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            .loading-text {
              color: #374151;
              font-size: 14px;
              margin: 0;
            }
            
            .error-container {
              padding: 30px 20px;
              text-align: center;
              color: #b91c1c;
            }
            
            .error-icon {
              font-size: 32px;
              margin-bottom: 16px;
            }
            
            .error-message {
              font-size: 14px;
              color: #4b5563;
              margin: 8px 0 16px;
            }
            
            .retry-button {
              background: #000;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 8px 16px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.2s;
            }
            
            .retry-button:hover {
              background: #333;
            }
            
            /* Tab styles */
            .product-tabs {
              display: flex;
              gap: 8px;
              margin: 8px 0 16px 0;
            }
            
            .tab-btn {
              flex: 1;
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              font-size: 14px;
              font-weight: 500;
              color: #4b5563;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .tab-btn.active {
              background-color: #e0e7ff;
              border-color: #c7d2fe;
              color: #4f46e5;
            }
            
            .tab-icon {
              flex-shrink: 0;
            }
            
            .product-tab-content {
              margin-bottom: 16px;
            }
            
            .tab-content {
              display: none;
              animation: fadeIn 0.3s ease-out forwards;
            }
            
            .tab-content.active {
              display: block;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            /* Product Details Tab Styles */
            .product-details {
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 16px;
              margin-top: 16px;
            }
            
            .product-details h4 {
              font-size: 15px;
              font-weight: 600;
              margin: 0 0 12px 0;
              color: #111827;
            }
            
            .specs-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-bottom: 16px;
            }
            
            .spec-item {
              display: flex;
              flex-direction: column;
            }
            
            .spec-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 2px;
            }
            
            .spec-value {
              font-size: 14px;
              font-weight: 500;
              color: #111827;
            }
            
            /* Compare Tab Styles */
            .compare-header {
              margin-bottom: 12px;
            }
            
            .compare-header h4 {
              font-size: 15px;
              font-weight: 600;
              margin: 0 0 4px 0;
              color: #111827;
            }
            
            .compare-header p {
              font-size: 13px;
              color: #4b5563;
              margin: 0;
            }
            
            .compare-products-list {
              display: flex;
              flex-direction: column;
              gap: 16px;
              margin-top: 16px;
            }
            
            .compare-product-item {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              transition: all 0.3s ease;
              background-color: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .compare-product-item[data-expanded="true"] {
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .compare-product-overview {
              display: grid;
              grid-template-columns: 60px 1fr auto;
              gap: 12px;
              padding: 12px;
              align-items: center;
              background-color: #fbfbfc;
              cursor: pointer;
            }
            
            .compare-product-image {
              width: 60px;
              height: 60px;
              border-radius: 6px;
              background-size: cover;
              background-position: center;
              border: 1px solid #f0f0f4;
            }
            
            .compare-product-info {
              overflow: hidden;
            }
            
            .compare-product-title {
              font-weight: 600;
              font-size: 14px;
              color: #111827;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .compare-product-store {
              font-size: 12px;
              color: #4b5563;
              margin-bottom: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            
            .best-deal-tag {
              font-size: 10px;
              font-weight: 600;
              background-color: #10b981;
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              display: inline-block;
              margin-left: 6px;
            }
            
            .compare-product-price {
              font-weight: 700;
              font-size: 15px;
              color: #111827;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .compare-product-savings {
              font-size: 11px;
              font-weight: 500;
              color: #10b981;
            }
            
            .compare-product-actions {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .compare-expand-button {
              display: flex;
              align-items: center;
              justify-content: center;
              background: none;
              border: none;
              padding: 6px;
              cursor: pointer;
              color: #6b7280;
              border-radius: 50%;
              transition: all 0.2s ease;
            }
            
            .compare-expand-button:hover {
              background-color: #f3f4f6;
              color: #111827;
            }
            
            .compare-product-item[data-expanded="true"] .compare-expand-button svg {
              transform: rotate(180deg);
            }
            
            .compare-product-details {
              height: 0;
              overflow: hidden;
              padding: 0 16px;
              background-color: white;
              transition: height 0.3s ease, opacity 0.3s ease;
              opacity: 0;
              border-top: 0px solid transparent;
            }
            
            .compare-details-grid {
              display: flex;
              flex-direction: column;
              gap: 16px;
              padding-top: 16px;
            }
            
            .compare-details-section h4 {
              font-size: 13px;
              font-weight: 600;
              color: #111827;
              margin: 0 0 8px 0;
            }
            
            .compare-details-section p {
              font-size: 13px;
              line-height: 1.5;
              color: #4b5563;
              margin: 0;
            }
            
            .compare-specs-list {
              margin: 0;
              padding: 0;
              list-style: none;
              font-size: 13px;
              color: #4b5563;
            }
            
            .compare-specs-list li {
              display: flex;
              margin-bottom: 4px;
              line-height: 1.5;
            }
            
            .compare-specs-list li span:first-child {
              font-weight: 500;
              color: #6b7280;
              width: 100px;
              flex-shrink: 0;
            }
            
            .compare-details-footer {
              padding-bottom: 16px;
            }
            
            .compare-product-button {
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 6px 12px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s ease;
            }
            
            .compare-product-button:hover {
              background-color: #2563eb;
            }
            
            .compare-product-button.full-width {
              width: 100%;
              padding: 8px 16px;
              margin-top: 16px;
            }
          `;
          shadowRoot.appendChild(popupStyles);
        }
        
        // Show popup with loading indicator
        popupContainer.innerHTML = `
          <div class="popup-header">
            <h3>Product Scanner</h3>
            <button class="popup-close">&times;</button>
          </div>
          <div class="popup-content">
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p class="loading-text">Scanning product information...</p>
                  </div>
                </div>
        `;
        
        // Add event listener to close button
        const closeButton = popupContainer.querySelector('.popup-close');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            popupContainer.remove();
          });
        }
        
        try {
          // Get current tab URL
          const url = window.location.href;
          Logger.log('Extracting product information from:', url);
          
          // Call the AgentQL API through the background script
          const response = await chrome.runtime.sendMessage({
            action: 'extractWithAgentQL',
            url: url,
            includeAlternatives: true
          });
          
          Logger.log('AgentQL extraction response:', response);
          
          // Check if response is successful and has data
          if (response && response.success && response.data) {
            // Render product information
            renderProductInfo(popupContainer, response.data);
            
            // Immediately trigger search for similar products
            initiateProductSearch(popupContainer, response.data);
          } else {
            // Show error message
            showExtractionError(popupContainer, response?.error || 'Failed to extract product information');
          }
        } catch (error) {
          Logger.error('Error during product extraction:', error);
          showExtractionError(popupContainer, error instanceof Error ? error.message : 'An unknown error occurred');
        }
        
        // Function to initiate product search proactively
        function initiateProductSearch(container: HTMLElement, productData: any) {
          const compareProductsList = container.querySelector('.compare-products-list');
          const compareLoading = container.querySelector('.compare-loading');
          
          if (compareProductsList && compareLoading) {
            // Start searching for similar products right away
            (async () => {
              try {
                Logger.log('Proactively searching for similar products:', productData.title);
                
                // Call the background script to search for similar products
                const response = await chrome.runtime.sendMessage({
                  action: 'searchSimilarProducts',
                  product: {
                    title: productData.title || '',
                    description: productData.description || '',
                    price: productData.price || '',
                    image: productData.image || '',
                    website: productData.website || '',
                    category: productData.category || '',
                    brand: productData.brand || ''
                  },
                  maxResults: 5
                });
                
                Logger.log('Similar products search response:', response);
                
                // Hide the loading indicator
                if (compareLoading instanceof HTMLElement) {
                  compareLoading.style.display = 'none';
                }
                
                // Update the header text
                const compareHeader = container.querySelector('.compare-header p');
                
                // Check if response is successful and has data
                if (response && response.success && response.data && response.data.length > 0) {
                  if (compareHeader instanceof HTMLElement) {
                    compareHeader.textContent = `Found ${response.data.length} similar products`;
                  }
                  
                  // Show the product list
                  if (compareProductsList instanceof HTMLElement) {
                    compareProductsList.style.display = 'flex';
                    
                    // Generate HTML for each similar product and create a map to store prefetched data
                    const productDetailsCache = new Map();
                    
                    // Generate HTML for each similar product
                    response.data.forEach((product: any) => {
                      const productItem = document.createElement('div');
                      productItem.className = 'compare-product-item';
                      productItem.setAttribute('data-expanded', 'false');
                      
                      // Store the productItem element in the product object for reference when prefetch completes
                      product._element = productItem;
                      
                      // Format price for display if available
                      let displayPrice = product.price || 'Price not available';
                      
                      // Create the HTML content
                      productItem.innerHTML = `
                      <div class="compare-product-overview">
                          <div class="compare-product-image" style="background-image: url('${product.image || 'https://via.placeholder.com/60x60?text=No+Image'}');"></div>
                        <div class="compare-product-info">
                            <div class="compare-product-title">${product.title || 'Unknown Product'}</div>
                            <div class="compare-product-store">${product.website || 'Unknown Retailer'}</div>
                            <div class="compare-product-price">${displayPrice}</div>
                          </div>
                        <div class="compare-product-actions">
                          <button class="compare-expand-button" aria-label="Show more details">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        </div>
                      </div>
                      <div class="compare-product-details">
                        <div class="compare-details-grid">
                          <div class="compare-details-section">
                            <h4>Product Description</h4>
                              <p>${product.snippet || 'No description available'}</p>
                              </div>
                          <div class="compare-details-section">
                              <h4>Product Details</h4>
                            <ul class="compare-specs-list">
                                <li><span>Price:</span> ${displayPrice}</li>
                                <li><span>Retailer:</span> ${product.website || 'Unknown'}</li>
                            </ul>
                      </div>
                    </div>
                        <div class="compare-details-footer">
                            <div class="compare-buttons-container" style="display: flex; gap: 8px;">
                              <button class="compare-wishlist-button" data-product-link="${product.link || '#'}" data-product-title="${product.title || 'Unknown Product'}" style="flex: 1; padding: 8px 12px; background-color: #f3f4f6; color: #4f46e5; border: none; border-radius: 4px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                                Add to Wishlist
                        </button>
                              <a href="${product.link || '#'}" target="_blank" class="compare-product-button" style="flex: 1; padding: 8px 12px; background-color: #4f46e5; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 500; cursor: pointer; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                Go to Product
                              </a>
              </div>
            </div>
          </div>
        `;
        
                      compareProductsList.appendChild(productItem);
                    });
                    
                    // Setup expandable items functionality
                    setupExpandableItems(container, productDetailsCache);
                    
                    // Start prefetching all product details in parallel
                    prefetchProductDetails(response.data, productDetailsCache);
                  }
            } else {
                  // Show error message
                  if (compareHeader instanceof HTMLElement) {
                    compareHeader.textContent = 'No similar products found';
                  }
                  
                  if (compareProductsList instanceof HTMLElement) {
                    compareProductsList.innerHTML = `
                      <div class="compare-error">
                        <p>We couldn't find similar products. Please try again later.</p>
                      </div>
                    `;
                    compareProductsList.style.display = 'block';
                  }
                }
              } catch (error) {
                Logger.error('Error searching for similar products:', error);
                
                // Hide the loading indicator
                if (compareLoading instanceof HTMLElement) {
                  compareLoading.style.display = 'none';
                }
                
                // Update the header text
                const compareHeader = container.querySelector('.compare-header p');
                if (compareHeader instanceof HTMLElement) {
                  compareHeader.textContent = 'Error finding similar products';
                }
                
                // Show error message
                if (compareProductsList instanceof HTMLElement) {
                  compareProductsList.innerHTML = `
                    <div class="compare-error">
                      <p>An error occurred while searching for similar products. Please try again later.</p>
                  </div>
                `;
                  compareProductsList.style.display = 'block';
                }
              }
            })();
          }
        }
        
        // Function to prefetch product details for all similar products
        async function prefetchProductDetails(products: any[], detailsCache: Map<string, any>) {
          Logger.log(`Prefetching details for ${products.length} similar products`);
          
          // Process all products in parallel with Promise.all
          await Promise.all(
            products.map(async (product) => {
              if (!product.link || product.link === '#') {
                Logger.debug(`Skipping prefetch for product without valid URL: ${product.title}`);
                return;
              }
              
              try {
                Logger.debug(`Prefetching details for product: ${product.title} from ${product.link}`);
                
                // Call the AgentQL API through the background script
                const response = await chrome.runtime.sendMessage({
                  action: 'extractWithAgentQL',
                  url: product.link,
                  includeAlternatives: false
                });
                
                // If successful, store the data in the cache
                if (response && response.success && response.data) {
                  Logger.debug(`Successfully prefetched details for: ${product.title}`);
                  detailsCache.set(product.link, response.data);
                  
                  // Add a data attribute to the product element to indicate prefetch is complete
                  if (product._element) {
                    product._element.setAttribute('data-prefetched', 'true');
                  }
          } else {
                  Logger.error(`Failed to prefetch details for: ${product.title}`, response?.error || 'Unknown error');
                }
              } catch (error) {
                Logger.error(`Error prefetching details for product ${product.title}:`, error);
              }
            })
          );
          
          Logger.log(`Completed prefetching details for similar products`);
        }
        
        // Function to setup expandable items
        function setupExpandableItems(container: HTMLElement, productDetailsCache?: Map<string, any>) {
          const popupContent = container.querySelector('.popup-content');
          if (!popupContent) return;
          
          const productItems = popupContent.querySelectorAll('.compare-product-item');
          
          productItems.forEach((item) => {
            const productOverview = item.querySelector('.compare-product-overview');
            if (productOverview) {
              productOverview.addEventListener('click', function() {
                const isExpanded = item.getAttribute('data-expanded') === 'true';
                
                // Toggle data-expanded attribute
                item.setAttribute('data-expanded', isExpanded ? 'false' : 'true');
                
                // First collapse all other items if this one is expanding
                if (!isExpanded) {
                  productItems.forEach((otherItem) => {
                    if (otherItem !== item && otherItem.getAttribute('data-expanded') === 'true') {
                      otherItem.setAttribute('data-expanded', 'false');
                      const otherDetails = otherItem.querySelector('.compare-product-details') as HTMLElement;
                      if (otherDetails) {
                        otherDetails.style.height = '0px';
                        otherDetails.style.opacity = '0';
                        
                        // Reset any residual styles
                        setTimeout(() => {
                          otherDetails.style.padding = '0px';
                          otherDetails.style.borderTop = '0px solid transparent';
                        }, 300); // Match the transition duration
                      }
                    }
                  });
                }
                
                // Handle this item's expansion/collapse
                const detailsSection = item.querySelector('.compare-product-details') as HTMLElement;
                if (detailsSection) {
                  if (!isExpanded) {
                    // Expanding - Set initial styles
                    detailsSection.style.display = 'block';
                    detailsSection.style.height = 'auto';
                    detailsSection.style.padding = '16px';
                    detailsSection.style.opacity = '0';
                    detailsSection.style.overflow = 'hidden';
                    detailsSection.style.borderTop = '1px solid #e5e7eb';
                    
                    // Get the product URL to fetch detailed info
                    const productLink = detailsSection.querySelector('a.compare-product-button')?.getAttribute('href');
                    
                    // Setup wishlist button event listener
                    setupWishlistButton(detailsSection);
                    
                    // Clear existing details and just show loading state
                    const existingDetailsGrid = detailsSection.querySelector('.compare-details-grid') as HTMLElement;
                    if (existingDetailsGrid) {
                      // Check if we already have prefetched details for this product
                      const isPrefetched = item.getAttribute('data-prefetched') === 'true';
                      const hasCachedData = productDetailsCache && productLink && productDetailsCache.has(productLink);
                      
                      if (hasCachedData && productLink) {
                        // Use the cached data directly - no need for loading indicator
                        Logger.debug(`Using prefetched data for ${productLink}`);
                        
                        // Get the data from cache
                        const cachedData = productDetailsCache.get(productLink);
                        
                        // Render it immediately
                        renderDetailedProductInfo(existingDetailsGrid, cachedData);
                        
                        // Get height before displaying
                        const initialHeight = detailsSection.scrollHeight;
                        detailsSection.style.height = '0';
                        
                        // Trigger animation to show the content
                        setTimeout(() => {
                          detailsSection.style.transition = 'height 0.3s ease, opacity 0.3s ease';
                          detailsSection.style.height = initialHeight + 'px';
                          detailsSection.style.opacity = '1';
                        }, 10);
                      } else {
                        // Show loading state first
                        existingDetailsGrid.innerHTML = `
                          <div class="compare-details-loading" style="width: 100%; padding: 16px 0;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                              <div class="loading-spinner" style="width: 28px; height: 28px;"></div>
                              <p style="text-align: center; font-size: 13px; color: #6b7280; margin: 0;">
                                Loading detailed product information...
                              </p>
                            </div>
                          </div>
                        `;
                        
                        // Only fetch details if we have a valid product URL
                        if (productLink && productLink !== '#') {
                          // Get height before fetching
                          const initialHeight = detailsSection.scrollHeight;
                          detailsSection.style.height = '0';
                          
                          // Trigger animation to initially expand to show loading spinner
                          setTimeout(() => {
                            detailsSection.style.transition = 'height 0.3s ease, opacity 0.3s ease';
                            detailsSection.style.height = initialHeight + 'px';
                            detailsSection.style.opacity = '1';
                          }, 10);
                          
                          // Fetch detailed product information using AgentQL if not already prefetched
                          fetchDetailedProductInfo(productLink, existingDetailsGrid).then(() => {
                            // After content is loaded, update height to accommodate new content
                            setTimeout(() => {
                              // Remove fixed height to measure the new content
                              detailsSection.style.height = 'auto';
                              detailsSection.style.transition = 'none';
                              
                              // Get the new height
                              const newHeight = detailsSection.scrollHeight;
                              
                              // Restore transition and adjust height
                              setTimeout(() => {
                                detailsSection.style.transition = 'height 0.3s ease, opacity 0.3s ease';
                                detailsSection.style.height = newHeight + 'px';
                              }, 10);
                            }, 30);
                          });
                        } else {
                          // Show error for invalid URL
                          existingDetailsGrid.innerHTML = `
                            <div class="compare-error" style="width: 100%; padding: 16px 0;">
                              <div style="background-color: #fef2f2; border-radius: 6px; padding: 12px; display: flex; align-items: flex-start; gap: 12px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <div>
                                  <p style="color: #b91c1c; font-size: 14px; font-weight: 500; margin: 0 0 4px 0;">Unable to load product details</p>
                                  <p style="color: #b91c1c; font-size: 13px; margin: 0;">Invalid product URL</p>
                                </div>
                              </div>
                            </div>
                          `;
                          
                          // Animate to show error message
                          const initialHeight = detailsSection.scrollHeight;
                          detailsSection.style.height = '0';
                          
                          setTimeout(() => {
                            detailsSection.style.transition = 'height 0.3s ease, opacity 0.3s ease';
                            detailsSection.style.height = initialHeight + 'px';
                            detailsSection.style.opacity = '1';
                          }, 10);
                        }
                      }
                    }
                  } else {
                    // Collapsing
                    detailsSection.style.height = '0px';
                    detailsSection.style.opacity = '0';
                    
                    // Reset additional styles after animation completes
                    setTimeout(() => {
                      detailsSection.style.padding = '0px';
                      detailsSection.style.borderTop = '0px solid transparent';
                    }, 300); // Match the transition duration
                  }
                }
              });
            }
            
            // Add specific handler for expand button
            const expandButton = item.querySelector('.compare-expand-button');
            if (expandButton) {
              expandButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop propagation to handle the click here
                // Trigger click on the overview section
                const overview = item.querySelector('.compare-product-overview');
                if (overview) {
                  overview.dispatchEvent(new Event('click'));
                }
              });
            }
          });
        }
        
        // Function to setup wishlist button event listeners
        function setupWishlistButton(detailsSection: HTMLElement) {
          const wishlistButton = detailsSection.querySelector('.compare-wishlist-button');
          if (!wishlistButton) return;
          
          wishlistButton.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const button = e.currentTarget as HTMLElement;
            const productLink = button.getAttribute('data-product-link') || '';
            const productTitle = button.getAttribute('data-product-title') || 'Product';
            
            // Show loading state
            const originalContent = button.innerHTML;
            button.innerHTML = `
              <div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
              <span>Adding...</span>
            `;
            button.style.opacity = '0.7';
            button.style.pointerEvents = 'none';
            
            try {
              // Get additional product info if available
              let productDetails = {
                title: productTitle,
                description: '',
                price: '',
                image: '',
                website: new URL(productLink).hostname,
                url: productLink
              };
              
              // If we have more product info in the expandable card, use it
              const titleElement = detailsSection.querySelector('.product-title, .compare-product-title');
              const priceElement = detailsSection.querySelector('.product-price, .compare-product-price');
              const imageElement = detailsSection.querySelector('.product-image, .compare-product-image');
              const websiteElement = detailsSection.querySelector('.product-website, .compare-product-store');
              const descriptionElement = detailsSection.querySelector('.product-description, .compare-details-section p');
              
              if (titleElement) productDetails.title = titleElement.textContent?.trim() || productTitle;
              if (priceElement) productDetails.price = priceElement.textContent?.trim() || '';
              if (websiteElement) productDetails.website = websiteElement.textContent?.trim() || productDetails.website;
              if (descriptionElement) productDetails.description = descriptionElement.textContent?.trim() || '';
              if (imageElement) {
                const bgImg = window.getComputedStyle(imageElement as HTMLElement).backgroundImage;
                if (bgImg && bgImg !== 'none') {
                  const urlMatch = bgImg.match(/url\(['"]?(.*?)['"]?\)/);
                  if (urlMatch && urlMatch[1]) {
                    productDetails.image = urlMatch[1];
                  }
                }
              }
              
              // Reset button state before showing dialog
              button.innerHTML = originalContent;
              button.style.opacity = '1';
              button.style.pointerEvents = 'auto';
              
              // Show wishlist options dialog
              showWishlistOptionsDialog(productDetails, async (confirmed, options) => {
                if (confirmed) {
                  // Show loading state again
                  button.innerHTML = `
                    <div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
                    <span>Adding...</span>
                  `;
                  button.style.opacity = '0.7';
                  button.style.pointerEvents = 'none';
                  
                  // Add alert preferences to product details
                  if (options.alertOnStock) {
                    (productDetails as any).target = 'available';
                  } else if (options.priceLimit) {
                    (productDetails as any).target = `limit:${options.priceLimit}`;
                  }
                  
              // Call the addToWishlist API
              const response = await chrome.runtime.sendMessage({
                action: 'addToWishlist',
                product: productDetails
              });
              
              // Handle response
              if (response && response.success) {
                // Show success state
                button.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>Added!</span>
                `;
                button.style.backgroundColor = '#c7d2fe';
                button.style.color = '#4338ca';
                button.style.opacity = '1';
                
                // Show toast notification
                    let message = `${productTitle} added to wishlist!`;
                    if (options.alertOnStock) {
                      message += " We'll alert you when it's back in stock.";
                    } else if (options.priceLimit) {
                      message += ` We'll alert you when price drops below ${options.priceLimit}.`;
                    }
                    showNotification(message, 'success');
            } else {
                // Show error state
                button.innerHTML = originalContent;
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
                
                // Handle authentication errors
                if (response?.error?.includes('not logged in')) {
                  // Try anonymous sign in
                  const authResponse = await chrome.runtime.sendMessage({
                    action: 'signInAnonymously'
                  });
                  
                  if (authResponse?.success) {
                    // Try again after successful auth
                    setupWishlistButton(detailsSection);
                    return;
                  }
                }
                
                // Show error notification
                showNotification(response?.error || 'Failed to add to wishlist', 'error');
              }
                } else {
                  // User cancelled - restore button
                  button.innerHTML = originalContent;
                  button.style.opacity = '1';
                  button.style.pointerEvents = 'auto';
                }
              });
            } catch (error) {
              // Restore button on error
              button.innerHTML = originalContent;
              button.style.opacity = '1';
              button.style.pointerEvents = 'auto';
              
              // Show error notification
              showNotification('Error adding to wishlist', 'error');
              Logger.error('Error adding to wishlist:', error);
            }
          });
        }
        
        // Function to show wishlist options dialog
        function showWishlistOptionsDialog(
          productDetails: any, 
          callback: (confirmed: boolean, options: {alertOnStock: boolean, priceLimit: string}) => void
        ) {
          // Create dialog container
          const dialogOverlay = document.createElement('div');
          dialogOverlay.style.position = 'fixed';
          dialogOverlay.style.top = '0';
          dialogOverlay.style.left = '0';
          dialogOverlay.style.width = '100%';
          dialogOverlay.style.height = '100%';
          dialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          dialogOverlay.style.display = 'flex';
          dialogOverlay.style.alignItems = 'center';
          dialogOverlay.style.justifyContent = 'center';
          dialogOverlay.style.zIndex = '10000';
          dialogOverlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif';
          
          // Create dialog content
          const dialog = document.createElement('div');
          dialog.style.width = '320px';
          dialog.style.backgroundColor = 'white';
          dialog.style.borderRadius = '8px';
          dialog.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          dialog.style.overflow = 'hidden';
          
          // Check if product is out of stock
          const isOutOfStock = productDetails.availability && 
            (productDetails.availability.toLowerCase().includes('out of stock') || 
             productDetails.availability.toLowerCase().includes('unavailable'));
          
          // Set dialog content based on product availability
          dialog.innerHTML = `
            <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">Add to Wishlist</h3>
              <p style="margin: 8px 0 0; font-size: 14px; color: #4b5563;">
                ${productDetails.title}
              </p>
            </div>
            <div style="padding: 16px;">
              ${isOutOfStock ? `
                <div style="margin-bottom: 16px;">
                  <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="stockAlert" style="margin-right: 8px;" checked>
                    <span style="font-size: 14px; color: #374151;">
                      Alert me when product is back in stock
                    </span>
                  </label>
                </div>
              ` : `
                <div style="margin-bottom: 16px;">
                  <label for="priceLimit" style="display: block; font-size: 14px; color: #374151; margin-bottom: 4px;">
                    Alert me when price drops below:
                  </label>
                  <input type="text" id="priceLimit" placeholder="Enter price limit" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                </div>
              `}
            </div>
            <div style="padding: 12px 16px; background-color: #f9fafb; display: flex; justify-content: flex-end; gap: 8px;">
              <button id="cancelBtn" style="padding: 8px 12px; background-color: #f3f4f6; border: none; border-radius: 4px; font-size: 14px; color: #374151; cursor: pointer;">
                Cancel
              </button>
              <button id="confirmBtn" style="padding: 8px 12px; background-color: #4f46e5; border: none; border-radius: 4px; font-size: 14px; color: white; cursor: pointer;">
                Add to Wishlist
              </button>
            </div>
          `;
          
          // Add dialog to overlay
          dialogOverlay.appendChild(dialog);
          
          // Add to document body
          document.body.appendChild(dialogOverlay);
          
          // Add event listeners - Note that some elements might not exist depending on dialog type
          const stockAlertCheckbox = dialog.querySelector('#stockAlert') as HTMLInputElement | null;
          const priceLimitInput = dialog.querySelector('#priceLimit') as HTMLInputElement | null;
          const cancelBtn = dialog.querySelector('#cancelBtn') as HTMLButtonElement;
          const confirmBtn = dialog.querySelector('#confirmBtn') as HTMLButtonElement;
          
          // Handle cancel
          cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialogOverlay);
            callback(false, {alertOnStock: false, priceLimit: ''});
          });
          
          // Handle overlay click to close
          dialogOverlay.addEventListener('click', (e) => {
            if (e.target === dialogOverlay) {
              document.body.removeChild(dialogOverlay);
              callback(false, {alertOnStock: false, priceLimit: ''});
            }
          });
          
          // Handle confirm
          confirmBtn.addEventListener('click', () => {
            // Get values from the form elements that exist
            const alertOnStock = isOutOfStock && stockAlertCheckbox ? stockAlertCheckbox.checked : false;
            const priceLimit = !isOutOfStock && priceLimitInput ? priceLimitInput.value.trim() : '';
            
            document.body.removeChild(dialogOverlay);
            callback(true, {alertOnStock, priceLimit});
          });
        }
        
        // Function to show notifications/toast messages
        function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
          // Create notification element
            const notification = document.createElement('div');
          notification.className = 'shopbot-notification';
          
          // Set styles based on type
          let bgColor = '#3b82f6'; // info - blue
          let textColor = 'white';
          let icon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          `;
          
          if (type === 'success') {
            bgColor = '#10b981'; // green
            icon = `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
          } else if (type === 'error') {
            bgColor = '#ef4444'; // red
            icon = `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            `;
          }
          
          // Apply styles
          notification.style.cssText = `
                position: fixed;
            bottom: 20px;
                right: 20px;
            padding: 12px 16px;
            background-color: ${bgColor};
            color: ${textColor};
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 14px;
                max-width: 350px;
                  opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
          `;
          
          // Set content
          notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
          `;
          
          // Add to DOM
          document.body.appendChild(notification);
          
          // Animate in
          setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
          }, 10);
          
          // Auto remove after 4 seconds
            setTimeout(() => {
              notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
              
            // Remove from DOM after animation
              setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
              }, 300);
            }, 4000);
        }
        
        // Function to render product information
        function renderProductInfo(container: HTMLElement, productData: any): void {
          const productTitle = productData.title || 'Unknown Product';
          const productDescription = productData.description || 'No description available';
          const productPrice = productData.price || 'N/A';
          const productImage = productData.image || 'https://via.placeholder.com/300x300?text=No+Image';
          const productWebsite = productData.website || window.location.hostname;
          const productRating = productData.rating || null;
          const productReviewCount = productData.review_count || 0;
          const productBrand = productData.brand || 'Unknown Brand';
          const productAvailability = productData.availability || 'Unknown';
          const isInStock = productAvailability.toLowerCase().includes('in stock') || 
                          !productAvailability.toLowerCase().includes('out of stock');
          
          const popupContent = container.querySelector('.popup-content');
          if (!popupContent) return;
          
          // Format price if it's a number
          let formattedPrice = productPrice;
          if (!isNaN(Number(productPrice))) {
            formattedPrice = `$${Number(productPrice).toFixed(2)}`;
          }
          
          // Format rating
          let ratingStars = '';
          if (productRating !== null) {
            const fullStars = Math.floor(productRating);
            const hasHalfStar = productRating % 1 >= 0.5;
            
            for (let i = 0; i < fullStars; i++) {
              ratingStars += '★';
            }
            
            if (hasHalfStar) {
              ratingStars += '⯨';
            }
            
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            for (let i = 0; i < emptyStars; i++) {
              ratingStars += '☆';
            }
          }
          
          popupContent.innerHTML = `
            <div class="product-card">
              <div class="product-header">
                <h2 class="product-title">${productTitle}</h2>
                <div class="product-meta">
                  <span class="product-price">${formattedPrice}</span>
                  ${productBrand ? `<span class="product-brand">${productBrand}</span>` : ''}
                </div>
                <div class="product-website">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  ${productWebsite}
                </div>
                <div>
                  <span class="product-badge ${isInStock ? 'badge-instock' : 'badge-outofstock'}">
                    ${isInStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <!-- Add tabs navigation -->
                <div class="product-tabs">
                  <button class="tab-btn active" data-tab="details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Product Details
                  </button>
                  <button class="tab-btn" data-tab="compare">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    Compare
                  </button>
                </div>
              </div>
              
              <!-- Add tab contents section -->
              <div class="product-tab-content">
                <!-- Product Details Tab (default visible) -->
                <div class="tab-content active" id="details-content">
                  <div class="product-image" style="background-image: url('${productImage}');"></div>
                  
                  ${ratingStars ? `
                  <div class="product-rating">
                    <span class="product-rating-stars">${ratingStars}</span>
                    <span class="product-rating-count">(${productReviewCount} reviews)</span>
                  </div>
                  ` : ''}
                  
                  <p class="product-description">${productDescription}</p>
                  
                  <div class="product-details">
                    <h4>Product Specifications</h4>
                    <div class="specs-grid">
                      <div class="spec-item">
                        <span class="spec-label">Brand</span>
                        <span class="spec-value">${productBrand || 'Unknown'}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-label">Availability</span>
                        <span class="spec-value">${isInStock ? 'In Stock' : 'Out of Stock'}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-label">Rating</span>
                        <span class="spec-value">${productRating ? productRating + '/5' : 'No ratings'}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-label">Website</span>
                        <span class="spec-value">${productWebsite}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Compare Tab (hidden by default) -->
                <div class="tab-content" id="compare-content">
                  <div class="compare-header">
                    <h4>Similar Products</h4>
                    <p>Loading similar products...</p>
                  </div>
                  
                  <div class="compare-loading">
                    <div class="loading-spinner"></div>
                    <p>Searching for similar products...</p>
                  </div>
                  
                  <div class="compare-products-list" style="display: none;">
                    <!-- Similar products will be populated here -->
                  </div>
                </div>
              </div>
              
              <div class="product-footer">
                <button class="product-action primary">
                  Add to Wishlist
                </button>
                <button class="product-action secondary">
                  View on Site
                </button>
              </div>
            </div>
          `;
          
          // Add action button functionality
          const actionButtons = popupContent.querySelectorAll<HTMLElement>('.product-action');
          actionButtons.forEach(button => {
            button.addEventListener('click', () => {
              const action = button.textContent?.trim();
              Logger.log(`Product action clicked: ${action}`);
              
              if (action?.includes('Add to Wishlist')) {
                // Get product details from the UI
                const productTab = popupContent.querySelector('#details-content');
                let productDetails: any = {
                  title: 'Unknown Product',
                  description: '',
                  price: '',
                  image: '',
                  website: window.location.hostname,
                  url: window.location.href,
                  availability: ''
                };
                
                // Extract product details from the UI
                if (productTab) {
                  const titleElement = popupContent.querySelector('.product-title');
                  const priceElement = popupContent.querySelector('.product-price');
                  const imageElement = popupContent.querySelector('.product-image');
                  const websiteElement = popupContent.querySelector('.product-website');
                  const descriptionElement = popupContent.querySelector('.product-description');
                  const availabilityElement = popupContent.querySelector('.badge-outofstock, .badge-instock');
                  
                  if (titleElement) productDetails.title = titleElement.textContent?.trim() || 'Unknown Product';
                  if (priceElement) productDetails.price = priceElement.textContent?.trim() || '';
                  if (websiteElement) productDetails.website = websiteElement.textContent?.trim() || productDetails.website;
                  if (descriptionElement) productDetails.description = descriptionElement.textContent?.trim() || '';
                  if (availabilityElement) productDetails.availability = availabilityElement.textContent?.trim() || '';
                  
                  // Extract image URL from background-image style
                  if (imageElement) {
                    const bgImg = window.getComputedStyle(imageElement as HTMLElement).backgroundImage;
                    if (bgImg && bgImg !== 'none') {
                      const urlMatch = bgImg.match(/url\(['"]?(.*?)['"]?\)/);
                      if (urlMatch && urlMatch[1]) {
                        productDetails.image = urlMatch[1];
                      }
                    }
                  }
                }
                
                // Show wishlist options dialog
                showWishlistOptionsDialog(productDetails, (confirmed, options) => {
                  if (confirmed) {
                    // Add alert preferences to product details
                    if (options.alertOnStock) {
                      (productDetails as any).target = 'availability';
                    } else if (options.priceLimit) {
                      (productDetails as any).target = `limit:${options.priceLimit}`;
                    }
                    
                    // Call the addToWishlist API
                    chrome.runtime.sendMessage({
                      action: 'addToWishlist',
                      product: productDetails
                    }).then(response => {
                      let message = `${productDetails.title} added to wishlist!`;
                      if (options.alertOnStock) {
                        message += " We'll alert you when it's back in stock.";
                      } else if (options.priceLimit) {
                        message += ` We'll alert you when price drops below ${options.priceLimit}.`;
                      }
                      
                      // Show notification
                      showNotification(message, 'success');
                    }).catch(error => {
                      Logger.error('Error adding to wishlist:', error);
                      showNotification('Error adding to wishlist', 'error');
                    });
                  }
                });
              } else if (action?.includes('View on Site')) {
                // Just scroll to the product on the current page
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }
            });
          });
          
          // Add tab switching functionality
          const tabButtons = popupContent.querySelectorAll('.tab-btn');
          const tabContents = popupContent.querySelectorAll('.tab-content');
          
          tabButtons.forEach(button => {
            button.addEventListener('click', () => {
              const tabName = button.getAttribute('data-tab');
              
              // Remove active class from all buttons
              tabButtons.forEach(btn => btn.classList.remove('active'));
              
              // Add active class to clicked button
              button.classList.add('active');
              
              // Hide all tab content
              tabContents.forEach(content => {
                content.classList.remove('active');
              });
              
              // Show the selected tab content
              const selectedContent = popupContent.querySelector(`#${tabName}-content`);
              if (selectedContent) {
                selectedContent.classList.add('active');
              }
            });
          });
        }
        
        // Function to show extraction error
        function showExtractionError(container: HTMLElement, errorMessage: string): void {
          const popupContent = container.querySelector('.popup-content');
          if (!popupContent) return;
          
          popupContent.innerHTML = `
            <div class="error-container">
              <div class="error-icon">⚠️</div>
              <h3>Extraction Failed</h3>
              <p class="error-message">${errorMessage}</p>
              <button class="retry-button">Try Again</button>
            </div>
          `;
          
          // Add event listener to retry button
          const retryButton = popupContent.querySelector('.retry-button');
          if (retryButton) {
            retryButton.addEventListener('click', async () => {
              // Show loading indicator again
              popupContent.innerHTML = `
                <div class="loading-container">
                  <div class="loading-spinner"></div>
                  <p class="loading-text">Scanning product information...</p>
                </div>
              `;
              
              try {
                // Get current tab URL
                const url = window.location.href;
                Logger.log('Retrying product extraction from:', url);
                
                // Call the AgentQL API through the background script
                const response = await chrome.runtime.sendMessage({
                  action: 'extractWithAgentQL',
                  url: url,
                  includeAlternatives: true
                });
                
                Logger.log('AgentQL extraction response:', response);
                
                // Check if response is successful and has data
                if (response && response.success && response.data) {
                  // Render product information
                  renderProductInfo(container, response.data);
                  
                  // Immediately trigger search for similar products
                  initiateProductSearch(container, response.data);
                } else {
                  // Show error message
                  showExtractionError(container, response?.error || 'Failed to extract product information');
                }
              } catch (error) {
                Logger.error('Error during product extraction retry:', error);
                showExtractionError(container, error instanceof Error ? error.message : 'An unknown error occurred');
              }
            });
          }
        }
      });
      
      shadowContainer.appendChild(betterButton);
    }, 500);
    
    Logger.log('Enhanced ProductScanner button added to page');
  } catch (error) {
    Logger.error('Error injecting ProductScanner:', error);
  }
}

// Function to fetch detailed product information from AgentQL
async function fetchDetailedProductInfo(productUrl: string, container: HTMLElement) {
  try {
    Logger.log('Fetching detailed product info from:', productUrl);
    
    // Call the AgentQL API through the background script
    const response = await chrome.runtime.sendMessage({
      action: 'extractWithAgentQL',
      url: productUrl,
      includeAlternatives: false
    });
    
    Logger.log('Detailed product info response:', response);
    
    if (response && response.success && response.data) {
      renderDetailedProductInfo(container, response.data);
      return true;
    } else {
      // Show error message
      container.innerHTML = `
        <div class="compare-error" style="width: 100%;">
          <div style="background-color: #fef2f2; border-radius: 6px; padding: 12px; display: flex; align-items: flex-start; gap: 12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <p style="color: #b91c1c; font-size: 14px; font-weight: 500; margin: 0 0 4px 0;">Unable to load product details</p>
              <p style="color: #b91c1c; font-size: 13px; margin: 0;">Please try again later or visit the product page for more information.</p>
            </div>
          </div>
        </div>
      `;
      return false;
    }
  } catch (error) {
    Logger.error('Error fetching detailed product info:', error);
    container.innerHTML = `
      <div class="compare-error" style="width: 100%;">
        <div style="background-color: #fef2f2; border-radius: 6px; padding: 12px; display: flex; align-items: flex-start; gap: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <p style="color: #b91c1c; font-size: 14px; font-weight: 500; margin: 0 0 4px 0;">Error loading product details</p>
            <p style="color: #b91c1c; font-size: 13px; margin: 0;">${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          </div>
        </div>
      </div>
    `;
    return false;
  }
}

// Function to render detailed product information
function renderDetailedProductInfo(container: HTMLElement, productData: any) {
  Logger.debug('Product data received for detailed info:', productData);
  
  // Extract important fields with fallbacks
  const description = productData.description || null;
  
  // Handle specifications - could be in different formats depending on API response
  let specs = [];
  if (productData.specifications) {
    specs = productData.specifications;
  } else if (productData.specs) {
    specs = productData.specs;
  } else if (productData.product_specs) {
    specs = productData.product_specs;
  } else {
    // Create specs array from individual attributes if available
    const specAttributes = [
      { name: 'Brand', value: productData.brand },
      { name: 'SKU', value: productData.sku },
      { name: 'Category', value: productData.category },
      { name: 'Availability', value: productData.availability }
    ].filter(spec => spec.value); // Filter out undefined values
    
    if (specAttributes.length > 0) {
      specs = specAttributes;
    }
  }
  
  // Handle reviews - could be in different formats depending on API response
  let reviews = [];
  if (productData.reviews && Array.isArray(productData.reviews)) {
    reviews = productData.reviews;
  } else if (productData.top_customer_reviews && Array.isArray(productData.top_customer_reviews)) {
    reviews = productData.top_customer_reviews;
  } else if (productData.top_reviews && Array.isArray(productData.top_reviews)) {
    reviews = productData.top_reviews;
  }
  
  // Extract other fields
  const rating = productData.rating;
  const features = productData.features || [];
  
  Logger.debug('Processed data for rendering:', { 
    descriptionLength: description ? description.length : 0,
    specsLength: specs.length,
    reviewsLength: reviews.length,
    hasFeatures: features.length > 0
  });
  
  // Start building HTML content
  let html = `<div class="product-details-expanded" style="width: 100%;">`;
  
  // Only add sections that have data
  
  // Description section (only if we have a description)
  if (description && description !== 'No description available') {
    html += `
      <div class="details-section">
        <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 8px 0; display: flex; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Detailed Description
        </h4>
        <p style="font-size: 13px; line-height: 1.5; color: #4b5563; margin: 0 0 16px 0;">${description}</p>
      </div>
    `;
  }
  
  // Features section (only if we have features)
  if (features.length > 0) {
    html += `
      <div class="details-section">
        <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin: 16px 0 8px 0; display: flex; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Key Features
        </h4>
        <ul style="margin: 0 0 16px 0; padding-left: 20px;">
    `;
    
    features.forEach((feature: string) => {
      html += `<li style="font-size: 13px; color: #4b5563; margin-bottom: 4px;">${feature}</li>`;
    });
    
    html += `</ul></div>`;
  }
  
  // Specifications section (only if we have specs)
  if ((Array.isArray(specs) && specs.length > 0) || 
      (!Array.isArray(specs) && typeof specs === 'object' && Object.keys(specs).length > 0)) {
    html += `
      <div class="details-section">
        <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin: 16px 0 8px 0; display: flex; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;" stroke-linecap="round" stroke-linejoin="round">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          Specifications
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; background-color: #f9fafb; padding: 12px; border-radius: 6px;">
    `;
    
    // Handle both array and object formats for specs
    if (Array.isArray(specs)) {
      specs.forEach((spec: any) => {
        if (typeof spec === 'object') {
          const name = spec.name || spec.key || spec.label || '';
          const value = spec.value || spec.text || '';
          
          if (name && value) {
            html += `
              <div style="display: flex; flex-direction: column; margin-bottom: 4px;">
                <span style="font-size: 12px; color: #6b7280;">${name}</span>
                <span style="font-size: 13px; font-weight: 500; color: #111827;">${value}</span>
              </div>
            `;
          }
        } else if (typeof spec === 'string') {
          // Handle plain string specs (sometimes they're just text)
          html += `
            <div style="display: flex; flex-direction: column; margin-bottom: 4px; grid-column: span 2;">
              <span style="font-size: 13px; color: #4b5563;">${spec}</span>
            </div>
          `;
        }
      });
    } else if (typeof specs === 'object') {
      // Handle object format
      Object.entries(specs).forEach(([key, value]) => {
        if (value) {
          html += `
            <div style="display: flex; flex-direction: column; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #6b7280;">${key}</span>
              <span style="font-size: 13px; font-weight: 500; color: #111827;">${value}</span>
            </div>
          `;
        }
      });
    }
    
    html += `</div></div>`;
  }
  
  // Reviews section (only if we have reviews)
  if (reviews && reviews.length > 0) {
    html += `
      <div class="details-section">
        <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin: 16px 0 8px 0; display: flex; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Customer Reviews ${rating ? `(${rating}/5)` : ''}
        </h4>
    `;
    
    // Show at most 3 reviews to avoid making the card too tall
    const displayedReviews = reviews.slice(0, 3);
    
    displayedReviews.forEach((review: any) => {
      // Extract review text - handle different API formats
      let reviewText = '';
      if (typeof review === 'string') {
        reviewText = review;
      } else if (typeof review === 'object') {
        reviewText = review.text || review.content || review.review || review.comment || '';
      }
      
      // Extract rating and author if available
      let reviewRating = '';
      let reviewAuthor = '';
      
      if (typeof review === 'object') {
        if (review.rating) {
          reviewRating = `<span style="color: #facc15;">★</span> ${review.rating}/5`;
        }
        
        if (review.author || review.username || review.user) {
          reviewAuthor = `<span style="font-weight: 500;">${review.author || review.username || review.user}</span>`;
        }
      }
      
      if (reviewText) {
        html += `
          <div style="border-left: 2px solid #e5e7eb; padding-left: 12px; margin-bottom: 12px; background-color: #f9fafb; border-radius: 0 6px 6px 0; padding: 8px 12px;">
            <p style="font-size: 13px; font-style: italic; color: #4b5563; margin: 0 0 4px 0;">"${reviewText}"</p>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
              ${reviewAuthor}
              ${reviewRating}
            </div>
          </div>
        `;
      }
    });
    
    // Add view more link if there are more reviews
    if (reviews.length > 3) {
      html += `
        <div style="text-align: center; margin-top: 8px;">
          <span style="font-size: 12px; color: #4f46e5; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            See ${reviews.length - 3} more reviews
          </span>
        </div>
      `;
    }
    
    html += `</div>`;
  }
  
  // If we have no data to display, show a message
  if (!description && features.length === 0 && 
      (!specs || specs.length === 0 || (typeof specs === 'object' && Object.keys(specs).length === 0)) && 
      (!reviews || reviews.length === 0)) {
    html += `
      <div style="text-align: center; padding: 20px 0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">No detailed information available for this product.</p>
        <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0 0;">Visit the product page for more details.</p>
      </div>
    `;
  }
  
  html += `</div>`;
  
  // Set the HTML content
  container.innerHTML = html;
  
  // Let parent function know we've rendered the content
  return true;
}

// Content script definition
export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  main() {
    Logger.log('Content script main function is running');
    
    // Initialize UI (no toggle button)
    UIManager.createUI();
    
    // Add debug alert separately
    UIManager.createDebugAlert();
    
    // Inject the ProductScanner component
    injectProductScanner().catch(error => {
      Logger.error('Error injecting ProductScanner:', error);
    });

    // Set up message listener
    setupMessageListener();
  }
});
import browser from 'webextension-polyfill';
import { ExtractionStrategy } from '../services/product-extractor';
import { defineUnlistedScript } from 'wxt/sandbox';

// Make scan function accessible to inline handlers
declare global {
  interface Window {
    manualScan: (() => void) | undefined;
  }
}

// Response type definition
interface Product {
  title: string;
  description: string;
  price: string;
  image: string;
  website: string;
  availability?: string;
}

interface ApiResponse {
    success?: boolean;
  data?: Product | Product[] | any;
    error?: string;
  mockData?: boolean;
  }

/**
 * Main popup script
 */
export default defineUnlistedScript(() => {
  // DOM Elements
  let scanButton: HTMLButtonElement | null = null;
  let statusArea: HTMLDivElement | null = null;
  let resultsContainer: HTMLDivElement | null = null;
  let productsContainer: HTMLDivElement | null = null;
  let navMenu: HTMLDivElement | null = null;
  let debugPanel: HTMLDivElement | null = null;
  let debugInfo: HTMLDivElement | null = null;
  let debugButtons: HTMLDivElement | null = null;
  
  /**
   * Log message to both console and debug panel
   */
  function log(message: string, isError = false): void {
    const timestamp = new Date().toLocaleTimeString();
    console[isError ? 'error' : 'log'](`[${timestamp}] ${message}`);
    
    if (debugInfo) {
      const entry = document.createElement('div');
      entry.textContent = `[${timestamp}] ${message}`;
      if (isError) entry.style.color = '#ef4444';
      debugInfo.appendChild(entry);
      
      // Auto-scroll to bottom
      debugInfo.scrollTop = debugInfo.scrollHeight;
    }
  }

  /**
   * Show status message with appropriate styling
   */
  function showStatus(message: string, isSuccess: boolean): void {
    if (!statusArea) {
      log('Status element not found, cannot show status: ' + message, !isSuccess);
      return;
    }
    
    const statusContent = statusArea.querySelector('.status-content span');
    if (statusContent) {
      statusContent.textContent = message;
    }
    
    statusArea.classList.remove('hidden', 'success', 'error');
    statusArea.classList.add(isSuccess ? 'success' : 'error');
  }

  /**
   * Extract products from the current page
   */
  async function scanCurrentPage(): Promise<void> {
    log('Starting product scan');
    
    if (!scanButton) {
      log('Scan button not found', true);
      return;
    }

    // Update UI to loading state
    updateButtonToLoading(true);
    showStatus('Getting active tab...', true);
    
    try {
      // Get active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab || !activeTab.url || !activeTab.id) {
        throw new Error('No active tab found');
      }
      
      log(`Processing tab: ${activeTab.url}`);
      showStatus('Extracting products...', true);

      try {
        // Send message to background script for extraction
        const response = await extractProductsViaBackground(activeTab.url);
        handleExtractionResponse(response);
      } catch (error) {
        log(`Background extraction failed: ${error instanceof Error ? error.message : String(error)}`, true);
        showStatus(`Error: ${error instanceof Error ? error.message : 'API request failed'}`, false);
        
        // Try content script as fallback
        try {
          log('Attempting content script fallback');
          const response = await extractProductsViaContentScript(activeTab.id, activeTab.url);
          handleExtractionResponse(response);
        } catch (contentError) {
          log(`Content script fallback failed: ${contentError instanceof Error ? contentError.message : String(contentError)}`, true);
          showStatus('Error: Content script not available. Please refresh the page.', false);
        }
      }
    } catch (error) {
      log(`Scan failed: ${error instanceof Error ? error.message : String(error)}`, true);
      showStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
    } finally {
      // Reset UI
      updateButtonToLoading(false);
    }
  }

  /**
   * Extract products via background script
   */
  async function extractProductsViaBackground(url: string): Promise<ApiResponse> {
    log('Requesting extraction via background script');
    
    const response = await browser.runtime.sendMessage({
      action: 'crawlPage',
      url: url,
      strategy: ExtractionStrategy.LLM
    }) as ApiResponse;
    
    log(`Response received: ${JSON.stringify(response).substring(0, 100)}...`);
    return response;
  }

  /**
   * Extract products via content script (fallback)
   */
  async function extractProductsViaContentScript(tabId: number, url: string): Promise<ApiResponse> {
    log('Requesting extraction via content script');
    
    const response = await browser.tabs.sendMessage(tabId, {
      action: 'crawlPage',
      url: url,
      strategy: ExtractionStrategy.LLM
    }) as ApiResponse;
    
    log(`Response received: ${JSON.stringify(response).substring(0, 100)}...`);
    return response;
  }

  /**
   * Handle extraction response
   */
  function handleExtractionResponse(response: ApiResponse): void {
    if (response && response.success) {
      log('Success response received, processing data...');
      
      // Handle nested data structure if needed
      let dataToDisplay = response.data;
      if (dataToDisplay && dataToDisplay.data) {
        log('Found nested data structure, unwrapping...');
        dataToDisplay = dataToDisplay.data;
      }
      
      displayResults(dataToDisplay);
      showStatus('Products extracted successfully!', true);
    } else {
      log(`Error in response: ${response?.error || 'Unknown error'}`, true);
      showStatus(`Error: ${response?.error || 'Unknown error'}`, false);
    }
  }

  /**
   * Update button state to loading/normal
   */
  function updateButtonToLoading(isLoading: boolean): void {
    if (!scanButton) return;
    
    scanButton.disabled = isLoading;
    
    if (isLoading) {
      scanButton.classList.add('loading');
      
      // Add loading spinner
      const loadingSpinner = document.createElement('span');
      loadingSpinner.className = 'loading-spinner';
      scanButton.prepend(loadingSpinner);
      
      const buttonText = scanButton.querySelector('span:not(.scan-icon)');
      if (buttonText) {
        buttonText.textContent = 'Scanning...';
      }
    } else {
      scanButton.classList.remove('loading');
      
      // Remove loading spinner
      const spinner = scanButton.querySelector('.loading-spinner');
      if (spinner) spinner.remove();
      
      // Reset button text
      const buttonText = scanButton.querySelector('span:not(.scan-icon)');
      if (buttonText) {
        buttonText.textContent = 'Scan for Products';
      }
    }
  }
  
  /**
   * Display extraction results in the UI
   */
  function displayResults(data: any): void {
    log('Displaying results');
    
    if (!resultsContainer || !productsContainer) {
      log('Results container not found', true);
      return;
    }
    
      // Clear previous results
      productsContainer.innerHTML = '';
      
    // Process data into products array
    const products = processProductData(data);
      log(`Processing ${products.length} products`);
      
      if (products.length === 0) {
        log('No products found to display');
        productsContainer.innerHTML = '<p>No products found.</p>';
        resultsContainer.style.display = 'flex';
        resultsContainer.classList.add('visible');
        return;
      }
      
    // Build HTML for all products
    let productsHtml = '';
    
    // Render each product
    products.forEach((product, index) => {
      try {
        log(`Rendering product ${index + 1}: ${product.title || 'Unnamed product'}`);
        
        if (!product) {
          log(`Product at index ${index} is null or undefined`, true);
          return;
        }
        
        // Extract product fields with fallbacks
        const title = product.title || 'Unknown Product';
        const description = product.description || 'No description available';
        const price = product.price || 'Price not available';
        const website = product.website || 'Website not available';
        const image = product.image || '';
        const availability = product.availability || '';
        
        // Create HTML for this product
        productsHtml += `
          <div class="product-card">
            ${image ? `
          <div class="product-image">
                <img src="${image}" alt="${title}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x150?text=No+Image';">
          </div>
            ` : ''}
            <div class="product-content">
              <div class="product-title">${title}</div>
              <div class="product-price">${price}</div>
              ${availability ? `<div class="product-availability">${availability}</div>` : ''}
              <div class="product-description">${description}</div>
              <div class="product-website">${website}</div>
            </div>
          </div>
        `;
      } catch (error) {
        log(`Error rendering product ${index}: ${error instanceof Error ? error.message : String(error)}`, true);
        
        // Add error message for this product
        productsHtml += `
          <div class="product-card">
            <div class="product-content">
              <div class="product-title">Error displaying product</div>
              <div class="product-description">
                ${error instanceof Error ? error.message : 'Unknown error'}
              </div>
            </div>
          </div>
        `;
      }
    });
    
    // Add all products to the container at once
    productsContainer.innerHTML = productsHtml;
      
      // Show results container
      resultsContainer.style.display = 'flex';
      resultsContainer.classList.add('visible');
  }

  /**
   * Process data into a consistent product array
   */
  function processProductData(data: any): any[] {
    let products: any[] = [];
    
    // Log data structure for debugging
    log(`Data type: ${typeof data}, isArray: ${Array.isArray(data)}`);
    if (data) {
      log(`Data keys: ${Object.keys(data).join(', ')}`);
    }
    
    // Handle different data structures
    if (!data) {
      return [];
    } else if (Array.isArray(data)) {
      log('Data is already an array');
      products = data;
    } else if (data.products && Array.isArray(data.products)) {
      log('Found products array in data.products');
      products = data.products;
    } else if (data.data && data.data.products && Array.isArray(data.data.products)) {
      log('Found products array in data.data.products');
      products = data.data.products;
    } else if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).some(key => 
      ['title', 'description', 'price', 'image', 'website'].includes(key))) {
      // Looks like a single product
      log('Found direct product object with product fields');
      products = [data];
    } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data) && 
      Object.keys(data.data).some(key => ['title', 'description', 'price', 'image', 'website'].includes(key))) {
      // Nested product object
      log('Found nested product object in data.data');
      products = [data.data];
    }
    
    return products;
  }

  /**
   * Toggle navigation menu visibility
   */
  function toggleNavMenu(show?: boolean): void {
    if (!navMenu) return;
    
    if (show === undefined) {
      navMenu.classList.toggle('active');
    } else if (show) {
      navMenu.classList.add('active');
    } else {
      navMenu.classList.remove('active');
    }
  }

  /**
   * Toggle debug panel visibility
   */
  function toggleDebugPanel(show?: boolean): void {
    if (!debugPanel) return;
    
    if (show === undefined) {
      debugPanel.classList.toggle('visible');
    } else if (show) {
      debugPanel.classList.add('visible');
    } else {
      debugPanel.classList.remove('visible');
    }
  }

  /**
   * Add debug button to UI
   */
  function addDebugButton(): void {
    if (!debugButtons) return;
    
    const button = document.createElement('button');
    button.className = 'debug-button';
    button.textContent = 'Debug';
    button.addEventListener('click', () => toggleDebugPanel());
    
    debugButtons.appendChild(button);
    log('Debug button added');
  }

  /**
   * Initialize the UI and event listeners
   */
  function initializeUI(): void {
    // Initialize DOM elements
    scanButton = document.getElementById('scan-button') as HTMLButtonElement;
    statusArea = document.getElementById('status-area') as HTMLDivElement;
    resultsContainer = document.getElementById('results-container') as HTMLDivElement;
    productsContainer = document.getElementById('products-container') as HTMLDivElement;
    navMenu = document.getElementById('nav-menu') as HTMLDivElement;
    debugPanel = document.getElementById('debug-panel') as HTMLDivElement;
    debugInfo = document.getElementById('debug-info') as HTMLDivElement;
    debugButtons = document.getElementById('debug-buttons') as HTMLDivElement;
    
    // Navigation menu event listeners
    const openNavButton = document.getElementById('open-nav');
    const closeNavButton = document.getElementById('close-nav');
    const navOverlay = document.getElementById('nav-overlay');
    
    openNavButton?.addEventListener('click', () => toggleNavMenu(true));
    closeNavButton?.addEventListener('click', () => toggleNavMenu(false));
    navOverlay?.addEventListener('click', () => toggleNavMenu(false));
    
    // Debug panel event listeners
    const closeDebugButton = document.getElementById('close-debug');
    closeDebugButton?.addEventListener('click', () => toggleDebugPanel(false));
    
    // Add debug button
    addDebugButton();
    
    // Make scan function globally accessible
    window.manualScan = scanCurrentPage;
    
    // Add event listener for scan button (backup for inline handler)
    scanButton?.addEventListener('click', scanCurrentPage);
    
    log('UI initialized successfully');
  }

  // Initialize UI when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    log('DOM loaded, initializing UI');
    initializeUI();
  });
  
  // Log startup
  log('Popup script started');
}); 
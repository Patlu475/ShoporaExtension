import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductScanner from './popup/components/product-scanner';
import { defineUnlistedScript } from 'wxt/sandbox';

// Declare the global function type
declare global {
  interface Window {
    renderShopbotProductScanner: () => boolean;
  }
}

export default defineUnlistedScript(() => {
  // Define the render function
  function renderProductScanner(): boolean {
    const container = document.getElementById('shopbot-product-scanner-container');
    
    if (container) {
      // Create a root for React to render into
      const root = ReactDOM.createRoot(container);
      
      // Render the ProductScanner component
      root.render(
        <React.StrictMode>
          <ProductScanner />
        </React.StrictMode>
      );
      
      console.log('[ShopBot] ProductScanner component manually rendered');
      return true;
    } else {
      console.error('[ShopBot] ProductScanner container not found for manual rendering');
      return false;
    }
  }

  // Immediately expose the render function to the window object
  (window as any).renderShopbotProductScanner = renderProductScanner;

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Find the container created by the content script
    const container = document.getElementById('shopbot-product-scanner-container');
    
    if (container) {
      // Try to render using the global function we defined
      renderProductScanner();
      console.log('[ShopBot] ProductScanner component rendered on DOMContentLoaded');
    } else {
      console.error('[ShopBot] ProductScanner container not found');
    }
  });
}); 
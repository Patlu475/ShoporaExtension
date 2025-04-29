import { defineConfig } from 'wxt';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: () => ({
    name: 'ShopBot - Product Extractor',
    description: 'Extract product information from web pages using AI',
    version: '1.0.0',
    permissions: [
      'storage',
      'activeTab',
      'scripting',
      'tabs',
      'alarms',
      'notifications'
    ],
    host_permissions: [
      'https://api.openai.com/*',
      'https://*/',
      'http://*/',
      'http://*/*',
      'https://*/*'
    ],
    action: {
      default_title: 'ShopBot',
      default_popup: 'popup/index.html'
    },
    icons: {
      '16': 'assets/icon-16.png',
      '32': 'assets/icon-32.png',
      '48': 'assets/icon-48.png',
      '128': 'assets/icon-128.png'
    },
    background: {
      service_worker: 'background.ts',
      type: 'module'
    },
    web_accessible_resources: [
      {
        resources: ['product-scanner.js', 'product-scanner.css'],
        matches: ['<all_urls>']
      }
    ]
  }),
  outDir: '.output',
  runner: {
    startUrls: ['https://www.amazon.com/', 'https://www.walmart.com/']
  }
  // Note: To add the product-scanner entry point, place the file at:
  // entrypoints/product-scanner.ts or entrypoints/product-scanner/index.ts
});

import browser from 'webextension-polyfill';
import { ExtractionStrategy, productExtractorService } from './services/product-extractor';
import { wishlistService, authService, notificationService } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase/config';

// Set default extraction strategy preference
const PREFERRED_EXTRACTION_STRATEGY = ExtractionStrategy.AgentQL;

// Message types
interface CrawlPageMessage {
  action: 'crawlPage';
  url: string;
  strategy: ExtractionStrategy;
}

interface UpdateConfigMessage {
  action: 'updateConfig';
  config: Record<string, any>;
}

// Keep the old interface for backward compatibility
interface SearchSimilarProductsMessage {
  action: 'searchSimilarProducts';
  product: {
    title: string;
    description: string;
    price: string;
    image: string;
    website: string;
    availability?: string;
    category?: string;
  };
  maxResults?: number;
}

// Add a new interface for the searchSimilarProducts message with query parameter
interface SearchSimilarProductsQueryMessage {
  action: 'searchSimilarProducts';
  query: string;
  maxResults?: number;
}

// Add a new interface for AgentQL extraction
interface AgentQLExtractionMessage {
  action: 'extractWithAgentQL';
  url: string;
  includeAlternatives?: boolean;
}

// Add interfaces for wishlist operations
interface AddToWishlistMessage {
  action: 'addToWishlist';
  product: {
    title: string;
    description: string;
    price: string;
    image: string;
    website: string;
    availability?: string;
    category?: string;
    url?: string;
    target?: string | null;
  };
}

interface GetWishlistMessage {
  action: 'getWishlist';
}

interface RemoveFromWishlistMessage {
  action: 'removeFromWishlist';
  productId: string;
}

// Add a new interface for authentication operations
interface SignInMessage {
  action: 'signIn';
  email: string;
  password: string;
}

interface SignUpMessage {
  action: 'signUp';
  email: string;
  password: string;
}

interface SignOutMessage {
  action: 'signOut';
}

interface CheckAuthStatusMessage {
  action: 'checkAuthStatus';
}

interface GetCurrentUserMessage {
  action: 'getCurrentUser';
}

// Add notification check interface
interface CheckNotificationsMessage {
  action: 'checkNotifications';
}

// Add interface for ProductScanner injection
interface InjectProductScannerMessage {
  action: 'injectProductScanner';
}

// Define the union type to include both message formats
type Message = 
  | CrawlPageMessage 
  | UpdateConfigMessage 
  | SearchSimilarProductsMessage 
  | SearchSimilarProductsQueryMessage 
  | AgentQLExtractionMessage
  | AddToWishlistMessage
  | GetWishlistMessage
  | RemoveFromWishlistMessage
  | SignInMessage
  | SignUpMessage
  | SignOutMessage
  | CheckAuthStatusMessage
  | GetCurrentUserMessage
  | CheckNotificationsMessage
  | InjectProductScannerMessage;

// Type guard for message
function isMessage(message: unknown): message is Message {
  return typeof message === 'object' && message !== null && 'action' in message;
}

// Add timestamped logging
function logWithTimestamp(message: string, ...args: any[]) {
  const timestamp = new Date().toISOString().substring(11, 19); // HH:MM:SS
  console.log(`[${timestamp}] ${message}`, ...args);
}

// Helper function to get data from chrome storage
function getStorageData(key: string): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result);
    });
  });
}

// Helper function to set data in chrome storage
function setStorageData(data: Record<string, any>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
}

// Check for new notifications
async function checkForNewNotifications() {
  logWithTimestamp('Checking for new notifications...');
  
  // Check if user is logged in
  const user = authService.getCurrentUser();
  if (!user) {
    logWithTimestamp('No user logged in');
    return;
  }
  
  try {
    // Get the last notification check timestamp
    const data = await getStorageData('lastNotificationCheck');
    const lastCheck = data?.lastNotificationCheck || 0;
    
    // Get all unread notifications
    const notifications = await notificationService.getNotifications(user.uid);
    const newNotifications = notifications.filter(n => 
      !n.read && n.timestamp > lastCheck
    );
    
    // Update last check timestamp
    await setStorageData({ lastNotificationCheck: Date.now() });
    
    // Create browser notifications for new notifications
    newNotifications.forEach(notification => {
      createBrowserNotification(notification);
    });
    
    // If there are new notifications, update the badge
    if (newNotifications.length > 0) {
      updateBadge(newNotifications.length);
    }
  } catch (error) {
    console.error('Error checking for notifications:', error);
  }
}

// Create browser notification
function createBrowserNotification(notification: any) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../assets/icon-128.png',
    title: notification.type === 'price_alert' ? 'Price Alert!' : 'Back in Stock!',
    message: notification.message,
    priority: 2
  });
}

// Update badge with unread count
function updateBadge(count: number) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

export default {
  main() {
    logWithTimestamp('[DEBUG] Background script initialized');
    
    // Create an alarm to check for notifications every 15 minutes
    chrome.alarms.create('checkNotifications', {
      periodInMinutes: 15
    });

    // Listen for alarms
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'checkNotifications') {
        checkForNewNotifications();
      }
    });
    
    // Check for notifications when background script loads
    checkForNewNotifications();
    
    // Listen for auth state changes for notifications
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User signed in, check for notifications
          checkForNewNotifications();
        } else {
          // User signed out, clear badge
          updateBadge(0);
        }
      });
    }
    
    // Listen for messages from popup and content scripts
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      logWithTimestamp('[DEBUG] Received message in background:', message);
      
      // Create a function to safely send responses
      const safeSendResponse = (response: any) => {
        try {
          logWithTimestamp('[DEBUG] BACKGROUND: About to call sendResponse with:', response);
          sendResponse(response);
          logWithTimestamp('[DEBUG] BACKGROUND: sendResponse completed');
          return true;
        } catch (error) {
          console.error('[DEBUG] BACKGROUND: Error in sendResponse:', error);
          return false;
        }
      };
      
      // Verify it's a valid message
      if (!isMessage(message)) {
        console.error('[DEBUG] Invalid message format:', message);
        safeSendResponse({ success: false, error: 'Invalid message format' });
        return true;
      }
      
      // Handle check notifications action specifically
      if (message.action === 'checkNotifications') {
        checkForNewNotifications()
          .then(() => safeSendResponse({ success: true }))
          .catch(error => safeSendResponse({ success: false, error: error.message }));
        return true; // Indicates async response
      }
      
      // Handle the message asynchronously
      const handleMessage = async () => {
        try {
          switch (message.action) {
            case 'crawlPage':
              // Handle crawl page request
              try {
                const url = message.url;
                const strategy = message.strategy || PREFERRED_EXTRACTION_STRATEGY;
                logWithTimestamp(`[DEBUG] Crawling page: ${url} with strategy: ${strategy}`);
                
                // Use product extractor service to extract products
                // The API key will be used from the backend .env file
                const result = await productExtractorService.extractProducts(url, strategy);
                
                logWithTimestamp('[DEBUG] Extraction result from API:', result);
                
                // Ensure we have a valid response structure before returning
                if (result && result.success) {
                  // Log the full data for debugging instead of just keys
                  if (result.data) {
                    logWithTimestamp('[DEBUG] Data structure:', result.data);
                    
                    // Check if we have a nested data structure
                    if (result.data.data) {
                      logWithTimestamp('[DEBUG] Nested data detected:', result.data.data);
                    }
                  }
                  
                  // Return the response as-is
                  logWithTimestamp('[DEBUG] Sending success response back to content script');
                  safeSendResponse(result);
                } else {
                  // Log error
                  logWithTimestamp('[DEBUG] API returned error or invalid response:', result);
                  const errorResponse = result || {
                    success: false,
                    error: 'Invalid response from API'
                  };
                  logWithTimestamp('[DEBUG] Sending error response back to content script:', errorResponse);
                  safeSendResponse(errorResponse);
                }
              } catch (error) {
                console.error('[DEBUG] Error during extraction:', error);
                const errorResponse = {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error during extraction'
                };
                logWithTimestamp('[DEBUG] Sending error response from catch block:', errorResponse);
                safeSendResponse(errorResponse);
              }
              break;
            
            case 'searchSimilarProducts':
              // Handle search similar products request
              try {
                // Check if we have a product object (old format) or a query string (new format)
                let apiRequestBody;
                
                if ('product' in message) {
                  // Old format with full product object
                  const product = message.product;
                  const maxResults = message.maxResults || 5;
                  logWithTimestamp(`[DEBUG] Searching similar products for product:`, product);
                  
                  apiRequestBody = {
                    product,
                    max_results: maxResults
                  };
                } else if ('query' in message) {
                  // New format with just a query string
                  const query = message.query;
                  const maxResults = message.maxResults || 5;
                  logWithTimestamp(`[DEBUG] Searching similar products for query: ${query}`);
                  
                  // Create a simple product object with just the title
                  apiRequestBody = {
                    product: {
                      title: query,
                      description: '',
                      price: '',
                      image: '',
                      website: ''
                    },
                    max_results: maxResults
                  };
                } else {
                  throw new Error('Invalid message format: missing product or query');
                }
                
                // Call API endpoint for similar products
                // Use the getApiUrl method to get the API URL
                const apiUrl = productExtractorService.getApiUrl();
                const response = await fetch(`${apiUrl}/api/similar-products`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(apiRequestBody)
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`API responded with status: ${response.status} - ${errorText}`);
                }
                
                const result = await response.json();
                logWithTimestamp('[DEBUG] Similar products search result:', result);
                
                // Return the response as-is
                safeSendResponse(result);
              } catch (error) {
                console.error('[DEBUG] Error during similar products search:', error);
                const errorResponse = {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error during similar products search',
                  source: 'serpapi'
                };
                logWithTimestamp('[DEBUG] Sending error response from catch block:', errorResponse);
                safeSendResponse(errorResponse);
              }
              break;
            
            case 'extractWithAgentQL':
              // Handle AgentQL extraction request
              try {
                const url = message.url;
                const includeAlternatives = message.includeAlternatives || false;
                logWithTimestamp(`[DEBUG] Extracting with AgentQL: ${url}, includeAlternatives: ${includeAlternatives}`);
                
                // Call API endpoint for AgentQL extraction
                const apiUrl = productExtractorService.getApiUrl();
                const response = await fetch(`${apiUrl}/api/extract/agentql`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    url,
                    include_alternatives: includeAlternatives
                  })
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`API responded with status: ${response.status} - ${errorText}`);
                }
                
                const result = await response.json();
                logWithTimestamp('[DEBUG] AgentQL extraction result:', result);
                
                // Return the response as-is
                safeSendResponse(result);
              } catch (error) {
                console.error('[DEBUG] Error during AgentQL extraction:', error);
                const errorResponse = {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error during AgentQL extraction'
                };
                logWithTimestamp('[DEBUG] Sending error response from catch block:', errorResponse);
                safeSendResponse(errorResponse);
              }
              break;
            
            case 'addToWishlist':
              // Handle add to wishlist request
              try {
                // Get current user
                const currentUser = authService.getCurrentUser();
                
                // Check if user is logged in
                if (!currentUser) {
                  throw new Error('User not logged in');
                }
                
                const userId = currentUser.uid;
                const product = message.product;
                
                logWithTimestamp(`[DEBUG] Adding product to wishlist for user: ${userId}`, product);
                
                // Add product to wishlist with target
                const productId = await wishlistService.addToWishlist(userId, {
                  ...product,
                  target: product.target || null // Include target field, default to null if not provided
                });
                
                logWithTimestamp(`[DEBUG] Product added to wishlist with ID: ${productId}`);
                
                // Return success response
                safeSendResponse({
                  success: true,
                  data: {
                    productId
                  }
                });
              } catch (error) {
                console.error('[DEBUG] Error adding product to wishlist:', error);
                safeSendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error adding to wishlist'
                });
              }
              break;
            
            case 'getWishlist':
              // Handle get wishlist request
              try {
                // Get current user
                const currentUser = authService.getCurrentUser();
                
                // Check if user is logged in
                if (!currentUser) {
                  throw new Error('User not logged in');
                }
                
                const userId = currentUser.uid;
                
                logWithTimestamp(`[DEBUG] Getting wishlist for user: ${userId}`);
                
                // Get wishlist
                const products = await wishlistService.getWishlist(userId);
                
                logWithTimestamp(`[DEBUG] Got ${products.length} products from wishlist`);
                
                // Return success response
                safeSendResponse({
                  success: true,
                  data: {
                    products
                  }
                });
              } catch (error) {
                console.error('[DEBUG] Error getting wishlist:', error);
                safeSendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error getting wishlist'
                });
              }
              break;
            
            case 'removeFromWishlist':
              // Handle remove from wishlist request
              try {
                const productId = message.productId;
                
                logWithTimestamp(`[DEBUG] Removing product from wishlist: ${productId}`);
                
                // Remove product from wishlist
                await wishlistService.removeFromWishlist(productId);
                
                logWithTimestamp(`[DEBUG] Product removed from wishlist: ${productId}`);
                
                // Return success response
                safeSendResponse({
                  success: true
                });
              } catch (error) {
                console.error('[DEBUG] Error removing product from wishlist:', error);
                safeSendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error removing from wishlist'
                });
              }
              break;
            
            case 'signIn':
              // Handle signIn request
              try {
                const email = message.email;
                const password = message.password;
                logWithTimestamp(`[DEBUG] Signing in with email: ${email}`);
                
                // Authenticate with email and password
                await authService.signIn(email, password);
                
                logWithTimestamp('[DEBUG] Signed in');
                
                // Return success response
                safeSendResponse({
                  success: true
                });
              } catch (error) {
                console.error('[DEBUG] Error signing in:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error signing in';
                logWithTimestamp(`[DEBUG] Sign in error: ${errorMessage}`);
                safeSendResponse({
                  success: false,
                  error: errorMessage
                });
              }
              break;
            
            case 'signUp':
              // Handle signUp request
              try {
                const email = message.email;
                const password = message.password;
                logWithTimestamp(`[DEBUG] Creating account with email: ${email}`);
                
                // Create new user account
                await authService.signUp(email, password);
                
                logWithTimestamp('[DEBUG] Account created');
                
                // Return success response
                safeSendResponse({
                  success: true
                });
              } catch (error) {
                console.error('[DEBUG] Error creating account:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error creating account';
                logWithTimestamp(`[DEBUG] Sign up error: ${errorMessage}`);
                safeSendResponse({
                  success: false,
                  error: errorMessage
                });
              }
              break;
            
            case 'checkAuthStatus':
              // Handle checkAuthStatus request
              try {
                logWithTimestamp('[DEBUG] Checking authentication status');
                
                // Check authentication status
                const isAuthenticated = await authService.checkAuthStatus();
                
                logWithTimestamp('[DEBUG] Authentication status:', isAuthenticated);
                
                // Return success response
                safeSendResponse({
                  success: true,
                  data: {
                    isAuthenticated
                  }
                });
              } catch (error) {
                console.error('[DEBUG] Error checking authentication status:', error);
                safeSendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error checking authentication status'
                });
              }
              break;
            
            case 'getCurrentUser':
              // Handle getCurrentUser request
              try {
                logWithTimestamp('[DEBUG] Getting current user');
                
                // Get current user
                const currentUser = authService.getCurrentUser();
                
                if (currentUser) {
                  const user = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    isAnonymous: currentUser.isAnonymous
                  };
                  
                  logWithTimestamp('[DEBUG] Current user:', user);
                  
                  // Return success response with user data
                  safeSendResponse({
                    success: true,
                    data: {
                      user
                    }
                  });
                } else {
                  logWithTimestamp('[DEBUG] No current user');
                  safeSendResponse({
                    success: false,
                    error: 'No user logged in'
                  });
                }
              } catch (error) {
                console.error('[DEBUG] Error getting current user:', error);
                safeSendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error getting current user'
                });
              }
              break;
            
            case 'signOut':
              // Handle signOut request
              try {
                logWithTimestamp('[DEBUG] Signing out');
                
                // Sign out
                await authService.signOut();
                
                logWithTimestamp('[DEBUG] Signed out');
                
                // Return success response
                safeSendResponse({
                  success: true
                });
              } catch (error) {
                console.error('[DEBUG] Error signing out:', error);
                safeSendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error signing out'
                });
              }
              break;
            
            case 'checkNotifications':
              // Handle check notifications request
              try {
                logWithTimestamp('[DEBUG] Checking notifications');
                
                // Check for notifications
                await checkForNewNotifications();
                
                logWithTimestamp('[DEBUG] Notifications checked');
                
                // Return success response
                safeSendResponse({
                  success: true
                });
              } catch (error) {
                console.error('[DEBUG] Error checking notifications:', error);
                safeSendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error checking notifications'
                });
              }
              break;
            
            case 'injectProductScanner':
              // Handle injectProductScanner request
              try {
                logWithTimestamp('[DEBUG] Injecting product scanner');
                
                // Return success response
                safeSendResponse({
                  success: true
                });
              } catch (error) {
                console.error('[DEBUG] Error injecting product scanner:', error);
                safeSendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error injecting product scanner'
                });
              }
              break;
            
            default:
              // Unknown action
              logWithTimestamp(`[DEBUG] Unhandled message action: ${message.action}`);
              safeSendResponse({
                success: false,
                error: `Unhandled message action: ${message.action}`
              });
          }
        } catch (error) {
          console.error('[DEBUG] Error handling message:', error);
          safeSendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error handling message'
          });
        }
      };
      
      // Execute the async handler and return true to indicate we will use sendResponse asynchronously
      handleMessage();
      return true;
    });
  }
};

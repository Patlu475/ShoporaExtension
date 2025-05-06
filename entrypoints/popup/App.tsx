import React, { useState, useEffect, useCallback } from 'react';
import browser from 'webextension-polyfill';
import { ExtractionStrategy } from '../services/product-extractor';
import { cn } from './utils/cn';
import { toast } from 'react-hot-toast';

// Components
import Header from './components/Header';
import ScanButton from './components/ScanButton';
import MiniScanButton from './components/MiniScanButton';
import StatusArea from './components/StatusArea';
import ProductList from './components/ProductList';
import DebugPanel from './components/DebugPanel';
import DebugButton from './components/DebugButton';
import GridBeam from './components/GridBeam';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import LoadingScreen from './components/LoadingScreen';
import ProfilePage from './components/ProfilePage';
import WishlistPage from './components/WishlistPage';
import NotificationsPage from './components/NotificationsPage';
import UserMenu from './components/UserMenu';
import AuthUI from './components/AuthUI';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import ProductDetailsPage from './components/ProductDetailsPage';

// Types
export interface Product {
  id?: string;
  title: string;
  description: string;
  price: string;
  image: string;
  website: string;
  availability: string;
  category: string;
  url: string;
  target?: string;
  // Additional fields
  brand?: string;
  sku?: string;
  currency?: string;
  last_updated?: string;
  rating?: string;
  reviews?: number;
  reviews_list?: Array<{
    username?: string;
    review?: string;
    rating?: string | number;
  }>;
  link?: string;
  dateAdded?: number;
}

interface ApiResponse {
  success?: boolean;
  data?: Product | Product[] | any;
  error?: string;
  mockData?: boolean;
  reviews?: number;
}

interface DebugMessage {
  text: string;
  isError: boolean;
  timestamp: string;
}

type AuthPage = 'login' | 'signup' | null;

interface AuthState {
  isAuthenticated: boolean;
  email?: string;
  name?: string;
  lastLogin?: number;
  sessionTimeout?: number; // Default session timeout in milliseconds (24 hours)
}

// Session timeout constant - 1 month in milliseconds
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 * 30;

// Update the activePage type definition to be more specific with literal types
type ActivePage = 'home' | 'wishlists' | 'notifications' | 'profile';

// Add WishlistResponse interface
interface WishlistResponse {
  success: boolean;
  error?: string;
  data?: {
    products: Product[];
  };
}

const App: React.FC = () => {
  // App initialization state
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading ShopBot...');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [authUser, setAuthUser] = useState<{email?: string, name?: string}>({});
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isStatusSuccess, setIsStatusSuccess] = useState(true);
  const [isStatusHidden, setIsStatusHidden] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [debugMessages, setDebugMessages] = useState<DebugMessage[]>([]);
  
  // Add state for active page
  const [activePage, setActivePage] = useState<ActivePage>('home');
  
  // Add state for wishlist products
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  
  // Update default extraction strategy to AgentQL
  const [extractionStrategy, setExtractionStrategy] = useState<ExtractionStrategy>(ExtractionStrategy.AgentQL);

  // Add showAuthUI state
  const [showAuthUI, setShowAuthUI] = useState(false);

  // Add selectedProduct state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Logging function
  const log = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    console[isError ? 'error' : 'log'](`[${timestamp}] ${message}`);
    
    setDebugMessages(prev => [
      ...prev,
      { text: message, isError, timestamp }
    ]);
  };

  // Show status message
  const showStatus = (message: string, isSuccess: boolean) => {
    setStatusMessage(message);
    setIsStatusSuccess(isSuccess);
    setIsStatusHidden(false);
  };

  // Process product data
  const processProductData = (data: any): Product[] => {
    let products: Product[] = [];
    
    log(`Data type: ${typeof data}, isArray: ${Array.isArray(data)}`);
    if (data) {
      log(`Data keys: ${Object.keys(data).join(', ')}`);
    }
    
    if (!data) {
      return [];
    }
    
    // Special handling for the specific structure shown in the example
    if (typeof data === 'object' && !Array.isArray(data) && data.title) {
      log('Found a single product with title property');
      const product = ensureProductFields(data);
      if (Object.keys(product).length > 0) {
        products = [product];
        return products;
      }
    }
    
    // Handle common data structures
    if (Array.isArray(data)) {
      log('Data is already an array');
      products = data.map((product: any) => ensureProductFields(product));
    } else if (data.products && Array.isArray(data.products)) {
      log('Found products array in data.products');
      products = data.products.map((product: any) => ensureProductFields(product));
    } else if (data.data && data.data.products && Array.isArray(data.data.products)) {
      log('Found products array in data.data.products');
      products = data.data.products.map((product: any) => ensureProductFields(product));
    } else if (typeof data === 'object' && !Array.isArray(data) && data.data && typeof data.data === 'object') {
      log('Found nested single product object in data.data');
      const product = ensureProductFields(data.data);
      if (Object.keys(product).length > 0) {
        products = [product];
      }
    } else if (typeof data === 'object' && !Array.isArray(data)) {
      log('Attempting to process as direct product object');
      try {
        // If all else fails, treat the entire object as a product
        const product = ensureProductFields(data);
        if (Object.keys(product).length > 0) {
          products = [product];
        }
      } catch (error) {
        log(`Error processing as product: ${error instanceof Error ? error.message : String(error)}`, true);
      }
    }
    
    log(`Processed ${products.length} products`);
    if (products.length > 0) {
      log(`First product: ${JSON.stringify(products[0]).substring(0, 200)}...`);
    }
    
    return products;
  };

  // Helper to ensure all required product fields are present
  const ensureProductFields = (data: any): Product => {
    if (!data) return {} as Product;
    
    // Check if we have the bare minimum for a valid product
    if (!data.title && !data.name) return {} as Product;
    
    // Prioritize consistent field names but fall back to alternatives
    return {
      title: data.title || data.name || '',
      description: data.description || data.info || '',
      price: data.price || data.priceFormatted || '',
      image: data.image || data.imageUrl || data.img || '',
      website: data.website || data.source || data.merchant || '',
      availability: data.availability || data.stock || '',
      category: data.category || data.productType || '',
      url: data.url || data.link || '',
      target: data.target || '',
      brand: data.brand || '',
      sku: data.sku || data.id || '',
      currency: data.currency || '',
      last_updated: data.last_updated || '',
      rating: data.rating || '',
      reviews: data.reviews || 0,
      reviews_list: data.reviews || data.reviews_list || [],
      link: data.link || data.url || '',
      dateAdded: data.dateAdded || Date.now()
    };
  };

  // Extract products via background script
  const extractProductsViaBackground = async (url: string): Promise<ApiResponse> => {
    log('Requesting extraction via background script');
    
    const response = await browser.runtime.sendMessage({
      action: 'crawlPage',
      url: url,
      strategy: ExtractionStrategy.LLM
    }) as ApiResponse;
    
    log(`Response received: ${JSON.stringify(response).substring(0, 100)}...`);
    return response;
  };

  // Extract products via content script (fallback)
  const extractProductsViaContentScript = async (tabId: number, url: string): Promise<ApiResponse> => {
    log('Requesting extraction via content script');
    
    const response = await browser.tabs.sendMessage(tabId, {
      action: 'crawlPage',
      url: url,
      strategy: ExtractionStrategy.LLM
    }) as ApiResponse;
    
    log(`Response received: ${JSON.stringify(response).substring(0, 100)}...`);
    return response;
  };

  // Handle extraction response
  const handleExtractionResponse = (response: ApiResponse) => {
    if (response && response.success) {
      log('Success response received, processing data...');
      
      try {
        // Log the raw response for debugging
        log(`Raw response data: ${JSON.stringify(response).substring(0, 200)}...`);
        
        // Handle nested data structure if needed
        let dataToDisplay = response.data;
        if (dataToDisplay && dataToDisplay.data) {
          log('Found nested data structure, unwrapping...');
          dataToDisplay = dataToDisplay.data;
        }
        
        // Add reviews to the data if they exist in the response
        if (response.reviews) {
          dataToDisplay.reviews = response.reviews;
        }
        
        const processedProducts = processProductData(dataToDisplay);
        
        // Check if we actually got products
        if (processedProducts.length > 0) {
          log(`Successfully processed ${processedProducts.length} products`);
          // Directly set the first product as selected instead of showing results
          setSelectedProduct(processedProducts[0]);
          setProducts(processedProducts);
          setIsResultsVisible(false);
          setIsStatusHidden(true);
        } else {
          log('No products were processed from the response', true);
          showStatus('No products found. Try scanning a different page.', false);
          setProducts([]); // Ensure products array is empty
          setIsResultsVisible(true); // Still show the results area with "no products" message
        }
      } catch (error) {
        log(`Error processing response data: ${error instanceof Error ? error.message : String(error)}`, true);
        showStatus(`Error processing data: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
        setProducts([]); // Ensure products array is empty
        setIsResultsVisible(true); // Still show the results area with error message
      }
    } else {
      log(`Error in response: ${response?.error || 'Unknown error'}`, true);
      showStatus(`Error: ${response?.error || 'Unknown error'}`, false);
      setProducts([]); // Ensure products array is empty
      setIsResultsVisible(true); // Still show the results area with error message
    }
  };

  // Extends the user session by updating the last login time
  const extendSession = () => {
    browser.storage.local.get('authState').then((result) => {
      const authState = result.authState as AuthState | undefined;
      if (authState && authState.isAuthenticated) {
        const updatedAuthState: AuthState = {
          ...authState,
          lastLogin: Date.now()
        };
        
        browser.storage.local.set({ authState: updatedAuthState }).catch(error => {
          log(`Error extending session: ${error instanceof Error ? error.message : String(error)}`, true);
        });
      }
    }).catch(error => {
      log(`Error accessing auth state: ${error instanceof Error ? error.message : String(error)}`, true);
    });
  };

  // Scan current page for products
  const scanCurrentPage = async () => {
    try {
      log('Starting extraction process');
      setIsLoading(true);
      setIsResultsVisible(false);
      setStatusMessage('');
      setIsStatusHidden(true);
      
      // Attempt to get the active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found. Please open a product page and try again.');
      }
      
      const activeTab = tabs[0];
      const tabId = activeTab.id;
      const url = activeTab.url;
      
      if (!url) {
        throw new Error('No URL found in the active tab.');
      }
      
      if (!url.startsWith('http')) {
        throw new Error('Please navigate to a website to extract product information.');
      }
      
      log(`Active tab URL: ${url}`);
      log(`Using extraction strategy: ${extractionStrategy}`);
      
      // Only use AgentQL extraction - no fallback to Crawl4AI
      try {
        log('Attempting extraction via AgentQL');
        
        // Always use AgentQL strategy regardless of the selected strategy
        const response = await browser.runtime.sendMessage({
          action: 'extractWithAgentQL',
          url: url,
          includeAlternatives: true
        }) as ApiResponse;
        
        log(`AgentQL extraction response: ${JSON.stringify(response)}`);
        
        if (response && response.success) {
          handleExtractionResponse(response);
          return;
        } else if (response && response.error) {
          throw new Error(`AgentQL extraction failed: ${response.error}`);
        }
      } catch (error) {
        log(`AgentQL extraction error: ${error instanceof Error ? error.message : String(error)}`, true);
        // No fallback to content script or Crawl4AI
        throw error;
      }
    } catch (error) {
      log(`Extraction failed: ${error instanceof Error ? error.message : String(error)}`, true);
      showStatus(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to fetch wishlist data
  const fetchWishlistData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsWishlistLoading(true);
    try {
      const response = await browser.runtime.sendMessage({
        action: 'getWishlist'
      }) as WishlistResponse;
      
      if (response && response.success && response.data?.products) {
        setWishlistProducts(response.data.products);
        log('Wishlist data loaded successfully');
      } else {
        const errorMsg = response?.error || 'Failed to load wishlist';
        log(`Error loading wishlist: ${errorMsg}`, true);
      }
    } catch (error) {
      log(`Error fetching wishlist: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsWishlistLoading(false);
    }
  }, [isAuthenticated]);

  // Add function to fetch notification data
  const fetchNotificationsData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      // Import dynamically to avoid circular dependency
      const { notificationService } = await import('../services/firebase/notifications');
      
      // Force fetch from database by setting skipCache to true
      await notificationService.getNotifications(authUser.email || '', true);
      log('Notifications data loaded successfully');
    } catch (error) {
      log(`Error fetching notifications: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  }, [isAuthenticated, authUser.email]);

  // Load wishlist and notification data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistData();
      fetchNotificationsData();
    } else {
      // Clear data when user logs out
      setWishlistProducts([]);
    }
  }, [isAuthenticated, fetchWishlistData, fetchNotificationsData]);

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    // In a real app, this would authenticate with a backend
    console.log('Login with:', email, password);
    
    try {
      // Save auth state to storage
      const authState: AuthState = {
        isAuthenticated: true,
        email: email,
        lastLogin: Date.now(),
        sessionTimeout: SESSION_TIMEOUT
      };
      
      log(`Saving auth state to storage with email: ${email}`);
      await browser.storage.local.set({ authState });
      
      // Update local state
      setAuthUser({ email });
      setIsAuthenticated(true);
      
      // Fetch wishlist data after successful login
      // Note: This will happen automatically due to the useEffect that watches isAuthenticated
    } catch (error) {
      log(`Error in handleLogin: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    // In a real app, this would register the user with a backend
    console.log('Sign up with:', name, email, password);
    
    try {
      // Save auth state to storage
      const authState: AuthState = {
        isAuthenticated: true,
        email: email,
        name: name,
        lastLogin: Date.now(),
        sessionTimeout: SESSION_TIMEOUT
      };
      
      log(`Saving auth state with name: ${name}`);
      await browser.storage.local.set({ authState });
      log('Auth state saved to storage');
      
      // Verify the save was successful
      const result = await browser.storage.local.get('authState');
      const savedState = result.authState as AuthState;
      log(`Verified saved state - name: ${savedState.name}, email: ${savedState.email}`);
      
      // Update local state
      log(`Updating authUser state with name: ${name}`);
      setAuthUser({ email, name });
      setIsAuthenticated(true);
      setActivePage('home'); // Set default page to home
      
      // Fetch wishlist data after successful signup
      // Note: This will happen automatically due to the useEffect that watches isAuthenticated
    } catch (error) {
      log(`Error in handleSignUp: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  };

  const handleGoogleSignIn = async () => {
    // In a real app, this would initiate OAuth flow
    console.log('Google sign in clicked');
    
    try {
      // Check if there's an existing auth state
      const result = await browser.storage.local.get('authState');
      const existingAuthState = result.authState as AuthState | undefined;
      
      // Mock Google user data
      const mockEmail = 'user@gmail.com';
      const mockName = existingAuthState?.email === mockEmail 
        ? existingAuthState.name 
        : 'Google User'; // Default name for new Google users
      
      const authState: AuthState = {
        isAuthenticated: true,
        email: mockEmail,
        name: mockName,
        lastLogin: Date.now(),
        sessionTimeout: SESSION_TIMEOUT
      };
      
      await browser.storage.local.set({ authState });
      log('Auth state saved to storage');
      
      setAuthUser({ email: mockEmail, name: mockName });
      setIsAuthenticated(true);
    } catch (error) {
      log(`Error saving auth state: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  };

  const handleLogout = () => {
    // Clear auth state in storage
    browser.storage.local.remove('authState').then(() => {
      log('Auth state cleared from storage');
    }).catch(error => {
      log(`Error clearing auth state: ${error instanceof Error ? error.message : String(error)}`, true);
    });
    
    setAuthUser({});
    setIsAuthenticated(false);
  };

  const handleSwitchAuthPage = (page: AuthPage) => {
    setAuthPage(page);
  };

  // Load auth state from storage on app initialization
  useEffect(() => {
    log('App initialized');
    
    // Reduced minimum loading time
    const minLoadingTime = 300; // Reduced from 800ms
    const startTime = Date.now();
    
    // Load auth state from storage
    browser.storage.local.get('authState').then((result) => {
      const authState = result.authState as AuthState | undefined;
      if (authState && authState.isAuthenticated) {
        // Check if session is still valid
        const currentTime = Date.now();
        const lastLoginTime = authState.lastLogin || 0;
        const sessionTimeout = authState.sessionTimeout || SESSION_TIMEOUT;
        
        if (currentTime - lastLoginTime > sessionTimeout) {
          // Session expired, log out
          log('Session expired, logging out');
          setLoadingMessage('Session expired, logging out...');
          
          browser.storage.local.remove('authState').catch(error => {
            log(`Error clearing auth state: ${error instanceof Error ? error.message : String(error)}`, true);
          });
        } else {
          log(`Restored auth session for: ${authState.email}`);
          setLoadingMessage(`Welcome back, ${authState.email}`);
          
          // Set authenticated state immediately for faster UI rendering
          setAuthUser({ 
            email: authState.email, 
            name: authState.name 
          });
          setIsAuthenticated(true);
          
          // Update last login time in the background
          const updatedAuthState: AuthState = {
            ...authState,
            lastLogin: currentTime
          };
          
          browser.storage.local.set({ authState: updatedAuthState }).catch(error => {
            log(`Error updating auth state: ${error instanceof Error ? error.message : String(error)}`, true);
          });
        }
      }
      
      // Faster loading time
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        setIsInitializing(false);
      }, remainingTime);
    }).catch(error => {
      log(`Error loading auth state: ${error instanceof Error ? error.message : String(error)}`, true);
      setLoadingMessage('Error loading your session');
      
      setIsInitializing(false);
    });
  }, []);

  // Replace handleDockNavigation with handleNavigation
  const handleNavigation = (page: ActivePage) => {
    setActivePage(page);
    setIsResultsVisible(false);
    setIsDebugVisible(false);
  };

  // Add a function to handle showing the auth UI
  const handleShowAuthUI = () => {
    setShowAuthUI(true);
  };

  // Add a function to handle auth success
  const handleAuthSuccess = () => {
    setShowAuthUI(false);
    // You might want to refresh data here if needed
  };

  // Update the renderProfilePage function
  const renderProfilePage = () => {
    if (!authUser) return null;
    
    return (
      <ProfilePage
        userData={{
          name: authUser.name || '',
          email: authUser.email || ''
        }}
        onLogout={handleLogout}
      />
    );
  };

  // Add handler for viewing product details
  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  // Add handler for going back from product details
  const handleBackFromDetails = () => {
    setSelectedProduct(null);
  };

  // Add handler for buying product
  const handleBuyNow = (product: Product) => {
    if (product.url) {
      browser.tabs.create({ url: product.url });
    }
  };

  // Add handler for setting price alert
  const handleSetPriceAlert = (product: Product) => {
    // Show alert preferences modal or handle price alert setting
    console.log('Setting price alert for:', product);
  };

  // Add handler for adding to wishlist
  const handleAddToWishlist = async (product: Product) => {
    try {
      const response = await browser.runtime.sendMessage({
        action: 'addToWishlist',
        product: {
          ...product,
          id: product.id || product.url || Math.random().toString(36).substring(7)
        }
      }) as WishlistResponse;

      if (response && response.success) {
        toast.success('Product added to wishlist');
        // Refresh wishlist data
        fetchWishlistData();
      } else {
        const errorMsg = response?.error || 'Failed to add to wishlist';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Error adding to wishlist');
    }
  };

  // Loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen message={loadingMessage} />;
  }

  // Render auth pages if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[600px] w-[350px] bg-white text-gray-900 overflow-hidden">
        {authPage === 'login' ? (
          <LoginPage 
            onLogin={handleLogin} 
            onGoogleSignIn={handleGoogleSignIn}
            onSwitchToSignUp={() => handleSwitchAuthPage('signup')}
          />
        ) : (
          <SignUpPage 
            onSignUp={handleSignUp}
            onGoogleSignIn={handleGoogleSignIn}
            onSwitchToLogin={() => handleSwitchAuthPage('login')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white">
      {isInitializing ? (
        <LoadingScreen message={loadingMessage} />
      ) : !isAuthenticated ? (
        authPage === 'login' ? (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignUp={() => handleSwitchAuthPage('signup')}
            onGoogleSignIn={handleGoogleSignIn}
          />
        ) : (
          <SignUpPage
            onSignUp={handleSignUp}
            onSwitchToLogin={() => handleSwitchAuthPage('login')}
            onGoogleSignIn={handleGoogleSignIn}
          />
        )
      ) : (
        <>
          {/* Only show header on home page and when no product is selected */}
          {activePage === 'home' && !selectedProduct && <Header />}
          
          {/* Main content area */}
          <div className={`${activePage === 'home' && !selectedProduct ? 'h-[calc(100%-48px)]' : 'h-full'} pb-16`}>
            {/* Product Details Page */}
            {selectedProduct ? (
              <ProductDetailsPage
                product={selectedProduct}
                onBack={handleBackFromDetails}
                onBuyNow={handleBuyNow}
                onAddToWishlist={handleAddToWishlist}
                onSetPriceAlert={handleSetPriceAlert}
              />
            ) : (
              <>
            {/* Home Page */}
            {activePage === 'home' && (
                  <HomePage
                          isLoading={isLoading}
                    isResultsVisible={isResultsVisible}
                    products={products}
                    extractionStrategy={extractionStrategy}
                    onScan={scanCurrentPage}
                    onClearResults={() => {
                            setIsResultsVisible(false);
                            setProducts([]);
                          }}
                    onStrategyChange={setExtractionStrategy}
                    onViewProductDetails={handleViewProductDetails}
                      />
            )}
            
            {/* Wishlist Page */}
            {activePage === 'wishlists' && (
              <WishlistPage 
                    propWishlistProducts={wishlistProducts.map(product => ({
                      ...product,
                      id: product.id || product.url || Math.random().toString(36).substring(7)
                    }))}
                    onViewProductDetails={handleViewProductDetails}
              />
            )}
            
            {/* Notifications Page */}
            {activePage === 'notifications' && (
              <NotificationsPage />
            )}
            
            {/* Profile Page */}
            {activePage === 'profile' && (
              <ProfilePage 
                userData={{
                  name: authUser.name || '',
                      email: authUser.email || ''
                }}
                onLogout={handleLogout}
              />
                )}
              </>
            )}
          </div>
          
          {/* Navigation - Only show when no product is selected */}
          {!selectedProduct && (
          <Navigation 
            activePage={activePage} 
            onNavigate={handleNavigation} 
          />
          )}
          
          {/* Debug Panel */}
          {isDebugVisible && (
            <DebugPanel 
              messages={debugMessages}
              isVisible={isDebugVisible}
              onClose={() => setIsDebugVisible(false)}
            />
          )}
          <DebugButton onClick={() => setIsDebugVisible(!isDebugVisible)} />
        </>
      )}
    </div>
  );
};

export default App; 
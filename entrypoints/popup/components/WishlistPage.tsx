import React, { useState, useEffect, useCallback } from 'react';
import GridBeam from './GridBeam';
import ProductCard from './ProductCard';
import browser from 'webextension-polyfill';
import { toast } from 'react-hot-toast';
import AuthUI from './AuthUI';
import { Product } from '../App';

interface WishlistResponse {
  success: boolean;
  error?: string;
  data?: {
    products: Product[];
  };
}

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface WishlistPageProps {
  wishlistProducts?: Product[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

enum AuthState {
  UNKNOWN = 'unknown',
  AUTHENTICATED = 'authenticated',
  NOT_AUTHENTICATED = 'not_authenticated',
  SHOW_AUTH_UI = 'show_auth_ui'
}

const WishlistPage: React.FC<WishlistPageProps> = ({ 
  wishlistProducts: propWishlistProducts = [], 
  isLoading: propIsLoading = false,
  onRefresh
}) => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>(propWishlistProducts);
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>(AuthState.UNKNOWN);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (propWishlistProducts) {
      setWishlistProducts(propWishlistProducts);
    }
  }, [propWishlistProducts]);

  useEffect(() => {
    setIsLoading(propIsLoading);
  }, [propIsLoading]);

  // Function to check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await browser.runtime.sendMessage({
        action: 'checkAuthStatus'
      }) as AuthResponse;

      if (response && response.success) {
        setAuthState(AuthState.AUTHENTICATED);
        return true;
      } else {
        setAuthState(AuthState.NOT_AUTHENTICATED);
        return false;
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setAuthState(AuthState.NOT_AUTHENTICATED);
      return false;
    }
  }, []);

  // Function to fetch wishlist data - only used if no props provided or for manual refresh
  const fetchWishlist = useCallback(async () => {
    // If onRefresh prop is provided, use that instead
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast.success('Wishlist refreshed successfully');
      } catch (err) {
        console.error('Error refreshing wishlist:', err);
        toast.error('Error refreshing wishlist');
      } finally {
        setIsRefreshing(false);
      }
      return;
    }

    // Otherwise use the original implementation
    setIsLoading(true);
    setError(null);

    try {
      // Check authentication status first
      const isAuthenticated = await checkAuthStatus();
      
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const response = await browser.runtime.sendMessage({
        action: 'getWishlist'
      }) as WishlistResponse;

      if (response && response.success && response.data?.products) {
        setWishlistProducts(response.data.products);
      } else {
        const errorMsg = response?.error || 'Failed to load wishlist';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Error loading wishlist data');
      toast.error('Error loading wishlist data');
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus, onRefresh]);

  // Handle manual refresh button click
  const handleRefresh = useCallback(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Function to handle authentication success
  const handleAuthSuccess = useCallback(() => {
    setAuthState(AuthState.AUTHENTICATED);
    fetchWishlist();
  }, [fetchWishlist]);

  // Function to show the auth UI
  const showAuthUI = useCallback(() => {
    setAuthState(AuthState.SHOW_AUTH_UI);
  }, []);

  // Function to remove a product from the wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!productId) {
      toast.error('Product ID is missing');
      return;
    }

    try {
      const response = await browser.runtime.sendMessage({
        action: 'removeFromWishlist',
        productId
      }) as WishlistResponse;

      if (response && response.success) {
        // Remove product from local state
        setWishlistProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productId)
        );
        toast.success('Product removed from wishlist');
      } else {
        const errorMsg = response?.error || 'Failed to remove product';
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Error removing product from wishlist');
    }
  }, []);

  // Fetch wishlist data on mount only if props aren't provided
  useEffect(() => {
    // Only fetch if no products are provided via props
    if (!propWishlistProducts || propWishlistProducts.length === 0) {
      checkAuthStatus().then(isAuthenticated => {
        if (isAuthenticated) {
          fetchWishlist();
        }
      });
    } else {
      // If products are provided via props, just check auth status
      checkAuthStatus();
    }
  }, [checkAuthStatus, fetchWishlist, propWishlistProducts]);

  // Render authentication UI if not authenticated
  if (authState === AuthState.SHOW_AUTH_UI) {
    return (
      <div className="w-full h-full absolute inset-0 overflow-hidden">
        {/* Gradient Header - Fixed at top */}
        <div className="relative h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 flex-shrink-0">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1">My Wishlist</h1>
              <p className="text-sm text-white/90">Your saved products</p>
            </div>
          </div>
        </div>

        {/* Auth UI */}
        <div className="absolute top-32 bottom-0 left-0 right-0 overflow-y-auto flex items-center justify-center p-4">
          <AuthUI 
            onSuccess={handleAuthSuccess} 
            onCancel={() => setAuthState(AuthState.NOT_AUTHENTICATED)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden">
      {/* Gradient Header - Fixed at top */}
      <div className="relative h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 flex-shrink-0">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">My Wishlist</h1>
            <p className="text-sm text-white/90">Your saved products</p>
          </div>
        </div>
      </div>

      {/* Refresh bar */}
      <div className="relative h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="text-sm text-gray-500">
          {authState === AuthState.AUTHENTICATED && wishlistProducts.length > 0 
            ? `${wishlistProducts.length} saved product${wishlistProducts.length !== 1 ? 's' : ''}` 
            : 'No saved products'}
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="flex items-center text-sm text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          <svg 
            className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Scrollable content area - adjusted for refresh bar */}
      <div className="absolute top-44 bottom-0 left-0 right-0 overflow-y-auto">
        <GridBeam className="min-h-full pb-16">
          <div className="px-4 py-4">
            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-600">Loading your wishlist...</p>
              </div>
            )}

            {/* Error state */}
            {!isLoading && error && authState === AuthState.AUTHENTICATED && (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load wishlist</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-4">
                  {error}
                </p>
                <button 
                  onClick={fetchWishlist}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Not authenticated state */}
            {!isLoading && authState === AuthState.NOT_AUTHENTICATED && (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">User not logged in</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-4">
                  Please sign in or create an account to access your wishlist
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={showAuthUI}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                  >
                    Sign In / Create Account
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && authState === AuthState.AUTHENTICATED && wishlistProducts.length > 0 && (
              <div className="grid grid-cols-1 gap-6 pb-24">
                {wishlistProducts.map((product, index) => (
                  <div key={product.id || `product-${index}`} className="relative">
                    <ProductCard
                      product={product}
                      index={index}
                      hideSimilarProducts={true}
                      isWishlist={true}
                    />
                    {/* Remove button */}
                    <button
                      onClick={() => product.id && removeFromWishlist(product.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && authState === AuthState.AUTHENTICATED && wishlistProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Start adding products to your wishlist to keep track of items you're interested in.
                </p>
              </div>
            )}
          </div>
        </GridBeam>
      </div>
    </div>
  );
};

export default WishlistPage; 
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'react-hot-toast';
import AuthUI from './AuthUI';
import WishlistHeader from './wishlist/WishlistHeader';
import WishlistTabs from './wishlist/WishlistTabs';
import WishlistItem from './wishlist/WishlistItem';
import browser from 'webextension-polyfill';

interface Product {
  id: string;
  title: string;
  price: string | number;
  image: string;
  availability?: string;
  store?: string;
  priceChange?: number;
  targetPrice?: string | number;
  inStock?: boolean;
  url?: string;
  link?: string;
}

interface WishlistResponse {
  success: boolean;
  error?: string;
  data?: {
    products: Product[];
  };
}

interface AuthResponse {
  isAuthenticated: boolean;
}

interface WishlistPageProps {
  propWishlistProducts?: Product[];
  onViewProductDetails: (product: Product) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({
  propWishlistProducts: initialProducts = [],
  onViewProductDetails
}) => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await browser.runtime.sendMessage({ action: 'checkAuth' }) as AuthResponse;
      setIsAuthenticated(response.isAuthenticated);
      return response.isAuthenticated;
    } catch (err) {
      console.error('Error checking auth status:', err);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    try {
      const response = await browser.runtime.sendMessage({
        action: 'getWishlist'
      }) as WishlistResponse;

      if (response && response.success && response.data) {
        // Process products to ensure proper availability and price formatting
        const processedProducts = response.data.products.map(product => ({
          ...product,
          inStock: product.availability?.toLowerCase().includes('in stock') || false,
          priceChange: product.priceChange || 0
        }));
        setWishlistProducts(processedProducts);
        setError(null);
      } else {
        const errorMsg = response?.error || 'Failed to fetch wishlist';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Error fetching wishlist');
      toast.error('Error fetching wishlist');
    }
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

  // Function to set price alert
  const setPriceAlert = useCallback(async (product: Product) => {
    try {
      const response = await browser.runtime.sendMessage({
        action: 'setPriceAlert',
        productId: product.id,
        targetPrice: product.targetPrice
      }) as WishlistResponse;

      if (response && response.success) {
        toast.success('Price alert set successfully');
      } else {
        const errorMsg = response?.error || 'Failed to set price alert';
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error setting price alert:', err);
      toast.error('Error setting price alert');
    }
  }, []);

  // Function to handle buy now
  const handleBuyNow = useCallback((product: Product) => {
    if (product.link) {
      browser.tabs.create({ url: product.link });
    } else {
      toast.error('Product URL not available');
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
      checkAuthStatus();
  }, [checkAuthStatus]);

  // Fetch wishlist data when authenticated
  useEffect(() => {
    if (isAuthenticated && (!initialProducts || initialProducts.length === 0)) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist, initialProducts]);

  // Calculate tab counts
  const tabCounts = {
    all: wishlistProducts.length,
    priceAlerts: wishlistProducts.filter(p => p.inStock).length,
    inStock: wishlistProducts.filter(p => !p.inStock).length
  };

  // Filter products based on active tab
  const filteredProducts = wishlistProducts.filter(product => {
    switch (activeTab) {
      case 'price-alerts':
        return product.inStock;
      case 'in-stock':
        return !product.inStock;
      default:
        return true;
    }
  });

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col h-[600px] w-[350px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Show auth UI only if explicitly not authenticated
  if (isAuthenticated === false) {
    return <AuthUI />;
  }

  return (
    <div className="flex flex-col h-[600px] w-[350px]">
      <WishlistHeader onAddItem={() => {}} />
      
      <WishlistTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={tabCounts}
      />

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-3 py-3">
          {error ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => fetchWishlist()}
                className="text-sm text-teal-500 hover:text-teal-600"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-gray-500 mb-2">No products found</p>
              <button
                onClick={() => fetchWishlist()}
                className="text-sm text-teal-500 hover:text-teal-600"
              >
                Refresh
              </button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <WishlistItem
                key={product.id}
                product={product}
                onViewDetails={onViewProductDetails}
                onRemove={removeFromWishlist}
                onSetPriceAlert={setPriceAlert}
                onBuyNow={handleBuyNow}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WishlistPage; 
import React, { useState, useCallback, memo, lazy, Suspense, useMemo } from 'react';
import browser from 'webextension-polyfill';
import toast from 'react-hot-toast';
// Import the ExpandableCard type but lazy load the component
import { SimilarProduct } from './ExpandableCard';
import { Product } from '../App'; // Import Product interface from App
import { cn } from '../lib/utils';
import AlertPreferencesModal from './AlertPreferencesModal';

// Lazy load the ExpandableCard component
const ExpandableCard = lazy(() => import('./ExpandableCard'));

// Define interface for reviews from AgentQL
interface ReviewItem {
  username?: string;
  review?: string;
  rating?: string | number;
}

interface SearchResponse {
  success: boolean;
  data?: SimilarProduct[];
  error?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  hideSimilarProducts?: boolean;
  isWishlist?: boolean;
}

// Define interface for the response from background script
interface WishlistResponse {
  success: boolean;
  error?: string;
  data?: {
    productId?: string;
  };
}

// Pure function moved outside component to prevent recreation
const getAvailabilityClass = (availability: string): string => {
  if (!availability) return 'text-gray-600';
  
  const availabilityLower = availability.toLowerCase();
  if (availabilityLower.includes('in stock') || availabilityLower.includes('available')) {
    return 'text-green-600';
  } else if (availabilityLower.includes('out of stock') || availabilityLower.includes('sold out') || availabilityLower.includes('unavailable')) {
    return 'text-red-600';
  } else {
    return 'text-gray-600';
  }
};

// Memoized placeholder image component for better performance
const ImagePlaceholder = memo(() => (
  <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded">
    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
));
ImagePlaceholder.displayName = 'ImagePlaceholder';

// Memoized loading spinner component
const LoadingSpinner = memo(() => (
  <span className="flex items-center justify-center">
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Searching...
  </span>
));
LoadingSpinner.displayName = 'LoadingSpinner';

// Memoized star icon component
const StarIcon = memo(() => (
  <svg className="h-3 w-3 mr-0.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
));
StarIcon.displayName = 'StarIcon';

// Add animation keyframes for the checkmark
const styles = `
  @keyframes check {
    0% {
      stroke-dashoffset: 26;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }
  .animate-check {
    stroke-dasharray: 26;
    stroke-dashoffset: 26;
    animation: check 0.3s ease-in-out forwards;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Memoize the product card for better performance
const ProductCard: React.FC<ProductCardProps> = memo(({ product, index = 0, hideSimilarProducts = false, isWishlist = false }) => {
  // Extract properties with fallbacks for all possible undefined values
  const { 
    title = 'Untitled Product', 
    description = '', 
    price = 'N/A', 
    image = '', 
    website = '', 
    availability = '', 
    category = '',
    brand = '',
    sku = '',
    rating = '',
    reviews = 0,
    url = ''
  } = product || {};
  
  const [isSearching, setIsSearching] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if search has been attempted
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Memoize the search query to prevent recreating it on every render
  const searchQuery = useMemo(() => {
    let query = title;
    
    if (brand && !title.toLowerCase().includes(brand.toLowerCase())) {
      query = `${brand} ${query}`;
    }
    
    if (category && !query.toLowerCase().includes(category.toLowerCase())) {
      query = `${query} ${category}`;
    }
    
    return query;
  }, [title, brand, category]);

  // Use memoized function for searching similar products
  const handleSearchSimilar = useCallback(async () => {
    if (isSearching) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      console.log(`Searching for products similar to: ${searchQuery}`);
      
      // Call the background script to search for similar products with a complete product object
      const response = await browser.runtime.sendMessage({
        action: 'searchSimilarProducts',
        product: {
          title: searchQuery, // Use the enhanced search query as title
          description: description || '',
          price: price || '',
          image: image || '',
          website: website || '',
          category: category || '',
          brand: brand || ''
        },
        maxResults: 5
      }) as SearchResponse;
      
      setHasSearched(true);
      
      if (response && response.success && response.data) {
        // Ensure the response data has the expected fields
        const processedData = response.data.map(product => ({
          ...product,
          reviews_content: product.reviews_content || [],
          reviews_count: product.reviews_count || 0
        }));
        setSimilarProducts(processedData);
        setShowSimilarProducts(true);
      } else {
        setError(response?.error || 'Failed to find similar products');
        setSimilarProducts([]);
      }
    } catch (err) {
      console.error('Error searching for similar products:', err);
      setError('Error searching for similar products');
      setSimilarProducts([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, description, price, image, website, isSearching, brand, category]);

  // Use memoized function for toggling similar products
  const toggleSimilarProducts = useCallback(() => {
    if (hasSearched) {
      setShowSimilarProducts(prev => !prev);
    } else {
      handleSearchSimilar();
    }
  }, [hasSearched, handleSearchSimilar]);

  // Use memoized function for opening product
  const handleProductOpen = useCallback((product: SimilarProduct) => {
    if (product.link) {
      window.open(product.link, '_blank');
    }
  }, []);

  // Memoize the availability class
  const availabilityClass = useMemo(() => 
    getAvailabilityClass(availability || ''),
    [availability]
  );

  // Memoize the loading state for button
  const buttonState = useMemo(() => {
    if (isSearching) {
      return {
        className: 'bg-gray-100 text-gray-400 cursor-not-allowed',
        content: <LoadingSpinner />
      };
    } else if (showSimilarProducts) {
      return {
        className: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
        content: 'Hide Similar Products'
      };
    } else {
      return {
        className: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        content: 'Find Similar Products'
      };
    }
  }, [isSearching, showSimilarProducts]);

  // Handle image load event
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const imageSrc = useMemo(() => 
    image || 'https://via.placeholder.com/150?text=No+Image',
    [image]
  );

  // Memoize the fallback for Suspense to prevent recreation
  const suspenseFallback = useMemo(() => (
    <div className="px-4 pb-4 pt-2">
      <div className="bg-gray-50 p-3 rounded-md text-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading similar products...</p>
      </div>
    </div>
  ), []);

  // Memoize the expandable card section
  const expandableCardSection = useMemo(() => (
    showSimilarProducts && (
      <Suspense fallback={suspenseFallback}>
        <div className="border-t border-gray-100">
          <ExpandableCard 
            products={similarProducts}
            onProductOpen={(product) => {
              if (product.link) {
                chrome.tabs.create({ url: product.link });
              }
            }}
          />
        </div>
      </Suspense>
    )
  ), [showSimilarProducts, similarProducts, suspenseFallback]);

  // Function to add product to wishlist with alert preferences
  const addToWishlist = useCallback(async (target?: string) => {
    // Show loading toast
    const toastId = toast.loading('Adding to wishlist...');
    setAddedToWishlist(true);

    try {
      // Create product object with all necessary data
      const wishlistProduct = {
        title,
        description,
        price,
        image: imageSrc,
        website,
        availability,
        category,
        url: product.url || window.location.href,
        target // Add the target for alerts
      };
      
      // Send message to background script to save to Firestore
      let response = await browser.runtime.sendMessage({
        action: 'addToWishlist',
        product: wishlistProduct
      }) as WishlistResponse;
      
      // If not authenticated, try to sign in anonymously and retry
      if (response && !response.success && response.error?.includes('not logged in')) {
        // Try to sign in anonymously
        const authResponse = await browser.runtime.sendMessage({
          action: 'signInAnonymously'
        }) as WishlistResponse;
        
        if (authResponse && authResponse.success) {
          // Try adding to wishlist again
          response = await browser.runtime.sendMessage({
            action: 'addToWishlist',
            product: wishlistProduct
          }) as WishlistResponse;
        } else {
          throw new Error(authResponse?.error || 'Authentication failed');
        }
      }
      
      // Check if response was successful
      if (response && response.success) {
        toast.success(`${title} added to wishlist!`, { id: toastId });
      } else {
        // If there was an error, show error toast and reset state
        const errorMsg = response?.error || 'Failed to add to wishlist';
        toast.error(errorMsg, { id: toastId });
        setAddedToWishlist(false);
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      toast.error('Error adding to wishlist', { id: toastId });
      setAddedToWishlist(false);
    }
  }, [product, title, description, price, imageSrc, website, availability, category]);

  // Function to handle wishlist button click
  const handleWishlistClick = useCallback(() => {
    // Check if product is available
    const available = availability?.toLowerCase().includes('in stock') || false;
    setIsAvailable(available);
    setShowAlertModal(true);
  }, [availability]);

  // Function to handle alert preferences confirmation
  const handleAlertConfirm = useCallback((target: string) => {
    setShowAlertModal(false);
    addToWishlist(target);
  }, [addToWishlist]);

  return (
    <div className="flex flex-col">
      {/* Product Card */}
      <div 
        className={cn(
          "relative bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex flex-col group",
          isWishlist ? "h-[320px]" : 
          product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 ? 
          "min-h-[300px]" : "h-[260px]"
        )}
      >
        {/* Product Image */}
        <div className="flex justify-center mb-2">
          <div className="h-24 w-24 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={product.image || "https://via.placeholder.com/96?text=No+Image"}
              alt={product.title}
              className="h-24 w-24 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "https://via.placeholder.com/96?text=No+Image";
              }}
            />
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-blue-600 font-medium text-sm mb-1">
          {product.price}
          {isWishlist && product.target && product.target.startsWith('limit:') && (
            <span className="ml-1 text-xs text-gray-500">
              (Target: {product.target.replace('limit:', '')})
            </span>
          )}
        </p>

        {/* Availability */}
        {product.availability && (
          <p className={cn(
            "text-xs font-medium mb-1",
            product.availability.toLowerCase().includes('in stock') 
              ? "text-green-600" 
              : product.availability.toLowerCase().includes('out of stock')
                ? "text-red-600"
                : "text-gray-600"
          )}>
            {product.availability}
            {isWishlist && product.target === 'available' && (
              <span className="ml-1 text-xs text-gray-500">
                (Alert set)
              </span>
            )}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className={cn(
            "text-xs text-gray-600 mb-2",
            isWishlist ? "line-clamp-3" : "line-clamp-2"
          )}>
            {product.description}
          </p>
        )}

        {/* Website */}
        <p className="text-[10px] text-gray-500 mb-2">
          {product.website}
        </p>

        {/* Category */}
        {product.category && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 mb-2">
            {product.category}
          </span>
        )}

        {/* Reviews Section - Only show if reviews array exists */}
        {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 && (
          <div className="mt-1 mb-2">
            <div className="flex items-center mb-1">
              <span className="text-xs font-medium text-gray-900">Reviews</span>
              {rating && (
                <div className="flex items-center ml-2">
                  <div className="flex items-center">
                    <StarIcon />
                    <span className="text-xs font-medium text-amber-500">{rating}</span>
                  </div>
                </div>
              )}
              {typeof reviews === 'number' && reviews > 0 && (
                <span className="text-[10px] text-gray-500 ml-1">({reviews})</span>
              )}
            </div>
            <div className="overflow-y-auto max-h-[120px] pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
              {(product.reviews as ReviewItem[]).slice(0, 2).map((review, index) => (
                <div key={index} className="p-1.5 bg-gray-50 rounded-md mb-1.5 last:mb-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] font-medium text-gray-700 truncate max-w-[70%]">
                      {review.username || 'Anonymous'}
                    </span>
                    {review.rating && (
                      <div className="flex items-center">
                        <StarIcon />
                        <span className="text-[10px] text-amber-500">{review.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-600 line-clamp-2">{review.review}</p>
                </div>
              ))}
              {product.reviews.length > 2 && (
                <button 
                  className="w-full text-[9px] text-blue-600 hover:text-blue-800 text-center mt-1 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Could implement a modal to show all reviews in the future
                  }}
                >
                  Show all {product.reviews.length} reviews
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add to Wishlist notification that appears on hover */}
        {!isWishlist && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 text-white p-2 rounded-b-lg transform translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center"
               onClick={handleWishlistClick}>
            {addedToWishlist ? (
              <div className="flex items-center">
                <svg className="w-5 h-5 animate-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-medium">Add to Wishlist</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confetti Icon (Similar Products) - Now positioned outside the card */}
      {!hideSimilarProducts && (
        <div className="relative mt-2">
          <div className="absolute -top-6 right-2">
            <button
              onClick={toggleSimilarProducts}
              disabled={isSearching}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all",
                isSearching
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : showSimilarProducts
                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              )}
              aria-label={showSimilarProducts ? "Hide Similar Products" : "Find Similar Products"}
            >
              {isSearching ? (
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 10.5L15 7.5M15 7.5L12 4.5M15 7.5H8C6.34315 7.5 5 8.84315 5 10.5C5 12.1569 6.34315 13.5 8 13.5H16C17.6569 13.5 19 14.8431 19 16.5C19 18.1569 17.6569 19.5 16 19.5H9M9 19.5L12 16.5M9 19.5L12 22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Similar Products Section */}
      {!hideSimilarProducts && showSimilarProducts && (
        <div className="mt-2">
          <Suspense fallback={suspenseFallback}>
            <ExpandableCard
              products={similarProducts}
              onProductOpen={handleProductOpen}
              isLoading={isSearching}
              errorMessage={error}
            />
          </Suspense>
        </div>
      )}

      {/* Alert Preferences Modal */}
      <AlertPreferencesModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onConfirm={handleAlertConfirm}
        productTitle={title}
        isAvailable={isAvailable}
        currentPrice={price}
      />
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 
import React, { useEffect, useId, useRef, useState, memo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { cn } from "../utils/cn";
import browser from 'webextension-polyfill';

export type SimilarProduct = {
  title: string;
  description: string;
  price: string;
  image: string;
  website: string;
  link?: string;
  availability?: string;
  category?: string;
  reviews_count?: number;
  reviews_content?: string[];
  rating?: string | number;
};

// Interface for AgentQL detailed product data
interface DetailedProductData {
  title: string;
  description: string;
  price: string;
  image: string;
  website: string;
  original_price?: string;
  discount_percentage?: string | number;
  currency?: string;
  availability?: string;
  rating?: string | number;
  review_count?: string | number;
  sku?: string;
  brand?: string;
  category?: string;
  reviews?: Array<{
    username?: string;
    review?: string;
    rating?: string | number;
  }>;
}

// Interface for API response
interface AgentQLResponse {
  success: boolean;
  data?: DetailedProductData & {
    top_customer_reviews?: Array<{
      username?: string;
      review?: string;
      rating?: string | number;
    }>;
  };
  reviews?: Array<{
    username?: string;
    review?: string;
    rating?: string | number;
  }>;
  error?: string;
}

interface ExpandableCardProps {
  products: SimilarProduct[];
  onProductOpen?: (product: SimilarProduct) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

// Memoized card item component for better performance
const CardItem = memo(({ 
  product, 
  id, 
  onCardClick 
}: { 
  product: SimilarProduct; 
  id: string; 
  onCardClick: (product: SimilarProduct) => void;
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardClick(product);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.link) {
      window.open(product.link, '_blank');
    }
  };

  return (
    <motion.div
      layoutId={`card-${product.title}-${id}`}
      onClick={handleCardClick}
      className="p-2 flex items-center hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 bg-white shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex gap-2 items-center w-full">
        <motion.div layoutId={`image-${product.title}-${id}`} className="h-12 w-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
          <img
            loading="lazy"
            width={48}
            height={48}
            src={product.image || "https://via.placeholder.com/48?text=No+Image"}
            alt={product.title}
            className="h-12 w-12 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "https://via.placeholder.com/48?text=No+Image";
            }}
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.h3
            layoutId={`title-${product.title}-${id}`}
            className="font-medium text-gray-900 text-xs line-clamp-1"
          >
            {product.title}
          </motion.h3>
          <motion.p
            layoutId={`price-${product.price}-${id}`}
            className="text-blue-600 text-xs font-medium"
          >
            {product.price}
          </motion.p>
          <motion.p
            layoutId={`website-${product.website}-${id}`}
            className="text-gray-500 text-[10px] truncate"
          >
            {product.website}
          </motion.p>
        </div>
        <motion.button
          layoutId={`open-button-${product.title}-${id}`}
          onClick={handleViewClick}
          className="px-2 py-1 text-[10px] rounded-md font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
        >
          View
        </motion.button>
      </div>
    </motion.div>
  );
});

CardItem.displayName = "CardItem";

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  products,
  onProductOpen,
  isLoading,
  errorMessage,
}) => {
  const [active, setActive] = useState<SimilarProduct | null>(null);
  const [detailedData, setDetailedData] = useState<DetailedProductData | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Use only necessary effects
  useEffect(() => {
    if (!active) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [active]);

  // Fetch detailed product data when active product changes
  useEffect(() => {
    if (!active || !active.link) {
      setDetailedData(null);
      return;
    }

    const fetchDetailedData = async () => {
      setIsLoadingDetails(true);
      setDetailsError(null);
      
      try {
        // Call AgentQL API via background script
        const response = await browser.runtime.sendMessage({
          action: 'extractWithAgentQL',
          url: active.link,
          includeAlternatives: false
        }) as AgentQLResponse;

        if (response && response.success) {
          // Debug the response to see what structure we're getting
          console.log('AgentQL response data:', response.data);
          
          // Check for reviews at the top level or within data
          let extractedReviews: Array<{
            username?: string;
            review?: string;
            rating?: string | number;
          }> = [];
          
          if (response.reviews && Array.isArray(response.reviews)) {
            // Reviews are at top level in response
            extractedReviews = response.reviews;
            console.log('Found top-level reviews:', extractedReviews.length);
          } else if (response.data?.reviews && Array.isArray(response.data.reviews)) {
            // Reviews are in data object
            extractedReviews = response.data.reviews;
            console.log('Found reviews in data:', extractedReviews.length);
          } else if (response.data?.top_customer_reviews && Array.isArray(response.data.top_customer_reviews)) {
            // Reviews are in top_customer_reviews
            extractedReviews = response.data.top_customer_reviews;
            console.log('Found top_customer_reviews:', extractedReviews.length);
          }
          
          // Create detailed data with reviews properly attached
          setDetailedData({
            title: response.data?.title || active.title,
            description: response.data?.description || active.description,
            price: response.data?.price || active.price,
            image: response.data?.image || active.image,
            website: response.data?.website || active.website,
            original_price: response.data?.original_price,
            discount_percentage: response.data?.discount_percentage,
            currency: response.data?.currency,
            availability: response.data?.availability,
            rating: response.data?.rating || active.rating,
            review_count: response.data?.review_count,
            sku: response.data?.sku,
            brand: response.data?.brand,
            category: response.data?.category || active.category,
            reviews: extractedReviews
          });
        } else {
          setDetailsError(response?.error || 'Failed to fetch detailed product data');
          // Fallback to basic product data if AgentQL fetch fails
          setDetailedData({
            title: active.title,
            description: active.description,
            price: active.price,
            image: active.image,
            website: active.website,
            rating: active.rating,
            reviews: []
          });
        }
      } catch (error) {
        console.error('Error fetching detailed product data:', error);
        setDetailsError('Error fetching detailed product data');
        // Fallback to basic product data if fetch fails
        setDetailedData({
          title: active.title,
          description: active.description,
          price: active.price,
          image: active.image,
          website: active.website,
          rating: active.rating,
          reviews: []
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetailedData();
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleOpenProduct = (product: SimilarProduct) => {
    setActive(product);
  };

  const handleClose = () => {
    setActive(null);
    setDetailedData(null);
    setDetailsError(null);
  };

  const handleBookmark = (e: React.MouseEvent, product: SimilarProduct) => {
    e.stopPropagation();
    // Functionality to be added later
    console.log('Bookmarked:', product.title);
  };

  // Optimized animations with less heavy transforms
  const overlayAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            {...overlayAnimation}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      
      {isLoading ? (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-center">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-1"></div>
          <p className="text-xs text-gray-600">Finding similar products...</p>
        </div>
      ) : errorMessage ? (
        <div className="mt-2 p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600">{errorMessage}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">No similar products found</p>
        </div>
      ) : (
        <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {products.map((product) => (
            <CardItem
              key={`${product.title}-${product.price}`}
              product={product}
              id={id}
              onCardClick={handleOpenProduct}
            />
          ))}
        </div>
      )}
      
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex absolute top-3 right-3 items-center justify-center bg-white rounded-full h-7 w-7 shadow-md"
              onClick={handleClose}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[400px] max-h-[70vh] flex flex-col bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100"
            >
              {/* Header section with image */}
              <div className="relative bg-gradient-to-b from-gray-50 to-white">
                {isLoadingDetails && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                <motion.div layoutId={`image-${active.title}-${id}`} className="flex justify-center py-2">
                  <img
                    loading="eager"
                    width={140}
                    height={140}
                    src={(detailedData?.image || active.image) || "https://via.placeholder.com/140?text=No+Image"}
                    alt={detailedData?.title || active.title}
                    className="w-auto h-[100px] object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://via.placeholder.com/140?text=No+Image";
                    }}
                  />
                </motion.div>
              </div>

              {/* Product details section */}
              <div className="flex-1 overflow-auto">
                <div className="px-3 py-2">
                  {/* Title and price */}
                  <div className="mb-1">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="text-sm font-bold text-gray-900 mb-0.5 line-clamp-2"
                    >
                      {detailedData?.title || active.title}
                    </motion.h3>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <motion.p
                          layoutId={`price-${active.price}-${id}`}
                          className="text-sm font-bold text-blue-600"
                        >
                          {detailedData?.price || active.price}
                        </motion.p>
                        {detailedData?.original_price && detailedData.original_price !== detailedData.price && (
                          <span className="text-xs line-through text-gray-500 ml-1">
                            {detailedData.original_price}
                          </span>
                        )}
                        {detailedData?.discount_percentage && (
                          <span className="text-xs bg-green-50 text-green-600 px-1 py-0.5 rounded ml-1">
                            -{detailedData.discount_percentage}%
                          </span>
                        )}
                      </div>
                      <motion.p
                        layoutId={`website-${active.website}-${id}`}
                        className="text-[10px] text-gray-500"
                      >
                        {detailedData?.website || active.website}
                      </motion.p>
                    </div>
                  </div>
                  
                  {/* Horizontal layout for category, brand, and availability */}
                  <div className="flex gap-1.5 mb-1.5 flex-wrap">
                    {/* Category */}
                    {(detailedData?.category || active.category) && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                        {detailedData?.category || active.category}
                      </span>
                    )}
                    
                    {/* Brand */}
                    {detailedData?.brand && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700">
                        {detailedData.brand}
                      </span>
                    )}
                    
                    {/* Availability */}
                    {(detailedData?.availability || active.availability) && (
                      <span className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                        (detailedData?.availability || active.availability || '').toLowerCase().includes('in stock') 
                          ? "bg-green-50 text-green-700" 
                          : (detailedData?.availability || active.availability || '').toLowerCase().includes('out of stock')
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-50 text-gray-700"
                      )}>
                        {detailedData?.availability || active.availability}
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  {(detailedData?.description || active.description) && (
                    <div className="mb-1.5">
                      <h4 className="text-xs font-medium text-gray-900 mb-0.5">Description</h4>
                      <p className="text-[10px] text-gray-600 leading-relaxed max-h-[80px] overflow-y-auto">
                        {detailedData?.description || active.description}
                      </p>
                    </div>
                  )}
                  
                  {/* SKU information if available */}
                  {detailedData?.sku && (
                    <div className="mb-1.5">
                      <p className="text-[10px] text-gray-500">
                        <span className="font-medium">SKU:</span> {detailedData.sku}
                      </p>
                    </div>
                  )}
                  
                  {/* AgentQL Reviews Section */}
                  {detailedData?.reviews && detailedData.reviews.length > 0 && (
                    <div className="mt-3 mb-2">
                      <h4 className="text-xs font-medium text-gray-900 mb-1">Customer Reviews ({detailedData.reviews.length})</h4>
                      <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1">
                        {detailedData.reviews.map((review, index) => {
                          console.log(`Rendering review ${index}:`, review);
                          return (
                            <div key={index} className="bg-gray-50 p-2 rounded-md">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[10px] font-medium text-gray-700 truncate max-w-[70%]">
                                  {review.username || 'Anonymous'}
                                </span>
                                {review.rating && (
                                  <div className="flex items-center">
                                    <svg className="h-3 w-3 mr-0.5 text-amber-500 fill-current" viewBox="0 0 24 24">
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    <span className="text-[10px] text-amber-500">{review.rating}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-[9px] text-gray-600 line-clamp-3">{review.review}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback Reviews Content (from search) */}
                  {(!detailedData?.reviews || detailedData.reviews.length === 0) && active.reviews_content && active.reviews_content.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-900 mb-1">Customer Reviews</h4>
                      <div className="max-h-[100px] overflow-y-auto space-y-2">
                        {active.reviews_content.map((review, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded-md">
                            <p className="text-[10px] text-gray-700">{review}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Rating */}
                  {(detailedData?.rating || active.rating) && (
                    <div className="flex items-center mt-1.5 mb-1.5">
                      <div className="flex items-center">
                        <span className="text-[10px] font-medium text-gray-700 mr-1">Rating:</span>
                        <div className="flex items-center">
                          <span className="text-[10px] font-medium text-amber-500 mr-1">{detailedData?.rating || active.rating}</span>
                          <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                      {(detailedData?.review_count || active.reviews_count) && (
                        <span className="text-[10px] text-gray-500 ml-2">
                          ({detailedData?.review_count || active.reviews_count} reviews)
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Error message if AgentQL fetch failed */}
                  {detailsError && (
                    <div className="mt-2 p-1.5 bg-red-50 rounded-md">
                      <p className="text-[10px] text-red-600">{detailsError}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-gray-100 py-2 px-3 flex justify-between items-center bg-gray-50">
                <motion.button
                  onClick={(e) => handleBookmark(e, active)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <BookmarkIcon />
                </motion.button>
                <motion.button
                  layoutId={`open-button-${active.title}-${id}`}
                  onClick={() => window.open(active.link, '_blank')}
                  className="px-3 py-1 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors text-xs"
                >
                  Open Product
                </motion.button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

// Memoize the icons for better performance
export const CloseIcon = memo(() => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
});

CloseIcon.displayName = "CloseIcon";

export const BookmarkIcon = memo(() => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  );
});

BookmarkIcon.displayName = "BookmarkIcon";

// ShoppingBag icon
export const ShoppingBagIcon = memo(() => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
});

ShoppingBagIcon.displayName = "ShoppingBagIcon";

// Add default export for lazy loading
export default ExpandableCard; 
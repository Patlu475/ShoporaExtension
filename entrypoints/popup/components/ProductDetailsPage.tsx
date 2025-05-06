import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Heart, ShoppingBag, Clock, Share2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Product } from '../App';
import AlertPreferencesModal from './AlertPreferencesModal';

interface SerpApiResponse {
  success: boolean;
  data?: Product[];
  error?: string;
}

interface AgentQLResponse {
  success: boolean;
  data?: {
    title: string;
    description: string;
    price: string;
    image: string;
    website: string;
    original_price: string;
    discount_percentage: string;
    currency: string;
    availability: string;
    rating: string;
    review_count: string;
    sku: string;
    brand: string;
  };
  reviews?: Array<{
    username: string;
    review: string;
    rating: string;
  }>;
  error?: string;
}

interface ProductDetailsPageProps {
  product: Product;
  onBack: () => void;
  onBuyNow: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onSetPriceAlert: (product: Product) => void;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  onBack,
  onBuyNow,
  onAddToWishlist,
  onSetPriceAlert
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, AgentQLResponse['data'] & { reviews?: AgentQLResponse['reviews'] }>>({});
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [tempProduct, setTempProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await browser.runtime.sendMessage({
          action: 'searchSimilarProducts',
          product: {
            title: product.title,
            description: product.description,
            price: product.price,
            image: product.image,
            website: product.website,
            category: product.category,
            brand: product.brand
          },
          maxResults: 5
        }) as SerpApiResponse;

        if (response.success && response.data) {
          setSimilarProducts(response.data);
          // Prefetch details for all similar products
          await prefetchProductDetails(response.data);
        } else {
          setError(response.error || 'Failed to fetch similar products');
        }
      } catch (err) {
        setError('Error fetching similar products');
        console.error('Error fetching similar products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const prefetchProductDetails = async (products: Product[]) => {
      const details: Record<string, AgentQLResponse['data'] & { reviews?: AgentQLResponse['reviews'] }> = {};
      
      // Filter out products without valid links
      const validProducts = products.filter((product: Product) => product.link && product.link !== '#');
      
      if (validProducts.length === 0) {
        setProductDetails(details);
        return;
      }

      try {
        // Create an array of promises for all products
        const fetchPromises = validProducts.map((product: Product) => 
          browser.runtime.sendMessage({
            action: 'extractWithAgentQL',
            url: product.link,
            includeAlternatives: false
          }) as Promise<AgentQLResponse>
        );

        // Wait for all promises to resolve
        const responses = await Promise.all(fetchPromises);

        // Process all responses
        responses.forEach((response, index) => {
          if (response.success && response.data) {
            const productLink = validProducts[index].link;
            if (productLink) {
              details[productLink] = {
                ...response.data,
                reviews: response.reviews
              };
            }
          }
        });

        setProductDetails(details);
      } catch (error) {
        console.error('Error prefetching product details:', error);
      }
    };

    fetchSimilarProducts();
  }, [product]);

  const handleExpand = (productLink: string) => {
    setExpandedProduct(expandedProduct === productLink ? null : productLink);
  };

  // Format price with proper currency symbol
  const formatPrice = (price: string | number) => {
    if (typeof price === 'string') {
      if (price.includes('$') || price.includes('€') || price.includes('£')) {
        return price;
      }
      const numericPrice = parseFloat(price);
      if (!isNaN(numericPrice)) {
        return `$${numericPrice.toFixed(2)}`;
      }
      return price;
    }
    return `$${price.toFixed(2)}`;
  };

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (!product.availability) return { status: 'Unknown', color: 'gray' };
    
    const availability = product.availability.toLowerCase();
    if (availability.includes('in stock')) {
      return { status: 'In Stock', color: 'green' };
    } else if (availability.includes('out of stock')) {
      return { status: 'Out of Stock', color: 'red' };
    } else if (availability.includes('pre-order')) {
      return { status: 'Pre-order', color: 'blue' };
    } else if (availability.includes('backorder')) {
      return { status: 'Backorder', color: 'yellow' };
    }
    return { status: product.availability, color: 'gray' };
  };

  const availability = getAvailabilityStatus();

  // Function to handle wishlist button click
  const handleWishlistClick = useCallback(() => {
    // Check if product is available
    const available = product.availability?.toLowerCase().includes('in stock') || false;
    setIsAvailable(available);
    setShowAlertModal(true);
  }, [product.availability]);

  // Function to handle alert preferences confirmation
  const handleAlertConfirm = useCallback((target: string) => {
    setShowAlertModal(false);
    // Add to wishlist with the target, excluding reviews
    const productToAdd = tempProduct || product;
    const { reviews, ...productWithoutReviews } = productToAdd;
    const productWithTarget = {
      ...productWithoutReviews,
      target
    };
    onAddToWishlist(productWithTarget);
    setTempProduct(null);
  }, [product, tempProduct, onAddToWishlist]);

  return (
    <div className="flex flex-col h-[600px] w-[350px] bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-400 to-sky-400 p-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-base font-bold text-white">Product Details</h1>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="pb-12">
          {/* Product Image */}
          <div className="relative bg-gray-50 p-3">
            <div className="relative h-32 mx-auto w-full flex items-center justify-center">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                className="object-contain h-full"
              />

              <button
                className={`absolute top-0 right-2 p-1.5 rounded-full ${isWishlisted ? "bg-pink-100 text-pink-500" : "bg-white/80 text-gray-500 hover:bg-white"} shadow-sm`}
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  onAddToWishlist(product);
                }}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-pink-500 text-pink-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3">
            <div className="flex gap-1 mb-2">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
              <Star className="h-3 w-3 text-gray-300" />
              <span className="text-xs text-gray-500 ml-1">(245 reviews)</span>
            </div>

            <h2 className="text-base font-bold text-gray-900 line-clamp-2">{product.title}</h2>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500">by</span>
              <span className="text-xs font-medium ml-1">{product.brand || 'Unknown Brand'}</span>
              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                Verified
              </Badge>
            </div>

            {/* Price and Stock */}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-sky-600">{formatPrice(product.price)}</div>
                {product.target && (
                  <div className="flex items-center text-xs">
                    <span className="text-gray-500">Target: {formatPrice(product.target)}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="text-xs mb-1 bg-teal-50 text-teal-700 border-teal-200">
                  Best Price
                </Badge>
                <div className="flex items-center">
                  <div className={`h-1.5 w-1.5 rounded-full bg-${availability.color}-500 mr-1`}></div>
                  <span className="text-xs text-gray-700">{availability.status}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <Button 
                className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 h-8 text-sm"
                onClick={() => onBuyNow(product)}
              >
                <ShoppingBag className="h-3 w-3 mr-1" />
                Buy Now
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-8 text-sm"
                onClick={handleWishlistClick}
              >
                Add to Wishlist
                <Heart className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <Button
              variant="secondary"
              className="mt-2 w-full flex items-center justify-center h-8 text-sm"
              onClick={handleWishlistClick}
            >
              <Clock className="h-3 w-3 mr-1" />
              Set Price Alert
            </Button>
          </div>

          <Separator className="my-2" />

          {/* Tabs for Details, Specs, Reviews */}
          <div className="px-3">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                <TabsTrigger value="specs" className="text-xs">Specs</TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
                <TabsTrigger value="similar" className="text-xs">Similar</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-3 space-y-3">
                <div>
                  <h3 className="text-xs font-semibold mb-1">Description</h3>
                  <p className="text-xs text-gray-700 line-clamp-3">
                    {product.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold mb-1">Key Features</h3>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li className="flex items-start">
                      <div className="h-4 w-4 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>{product.category}</span>
                    </li>
                    {product.brand && (
                      <li className="flex items-start">
                        <div className="h-4 w-4 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span>Brand: {product.brand}</span>
                      </li>
                    )}
                    {product.sku && (
                      <li className="flex items-start">
                        <div className="h-4 w-4 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span>SKU: {product.sku}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-3">
                <div className="text-xs text-gray-700 space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Brand</span>
                    <span className="font-medium">{product.brand || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">SKU</span>
                    <span className="font-medium">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">{product.rating || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-medium">
                      {Array.isArray(product.reviews) ? product.reviews.length : (product.reviews || 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium">{product.currency || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Website</span>
                    <span className="font-medium">{product.website || 'N/A'}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-3">
                <div className="space-y-4">
                  {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 ? (
                    product.reviews.map((review: any, index: number) => (
                      <div key={index} className="border-b pb-3 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium">{review.username || 'Anonymous'}</span>
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-3">{review.review}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-4">
                      No reviews available
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="similar" className="mt-3">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-sm text-gray-600">Loading similar products...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                ) : similarProducts.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-600">No similar products found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {similarProducts.map((similarProduct, index) => (
                      <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="relative h-20 w-20 bg-gray-50 rounded-md flex items-center justify-center">
                              <img
                                src={similarProduct.image || "/placeholder.svg"}
                                alt={similarProduct.title}
                                className="object-contain h-full"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xs font-semibold line-clamp-2 mb-1">
                                {similarProduct.title}
                              </h3>
                              <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < (similarProduct.rating ? Math.floor(parseFloat(similarProduct.rating)) : 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-blue-600">
                                  {similarProduct.price}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleExpand(similarProduct.link || '')}
                            >
                              {expandedProduct === similarProduct.link ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {expandedProduct === similarProduct.link && productDetails[similarProduct.link || ''] && (
                            <div className="mt-3 pt-3 border-t space-y-3">
                              {/* Description */}
                              <div>
                                <h4 className="text-xs font-semibold mb-1">Description</h4>
                                <p className="text-xs text-gray-700">
                                  {productDetails[similarProduct.link || '']?.description || 'No description available'}
                                </p>
                              </div>

                              {/* Specifications */}
                              <div>
                                <h4 className="text-xs font-semibold mb-1">Specifications</h4>
                                <div className="text-xs text-gray-700 space-y-1">
                                  {productDetails[similarProduct.link || '']?.brand && (
                                    <div className="flex justify-between">
                                      <span>Brand</span>
                                      <span>{productDetails[similarProduct.link || '']?.brand}</span>
                                    </div>
                                  )}
                                  {productDetails[similarProduct.link || '']?.sku && (
                                    <div className="flex justify-between">
                                      <span>SKU</span>
                                      <span>{productDetails[similarProduct.link || '']?.sku}</span>
                                    </div>
                                  )}
                                  {productDetails[similarProduct.link || '']?.rating && (
                                    <div className="flex justify-between">
                                      <span>Rating</span>
                                      <span>{productDetails[similarProduct.link || '']?.rating}</span>
                                    </div>
                                  )}
                                  {productDetails[similarProduct.link || '']?.review_count && (
                                    <div className="flex justify-between">
                                      <span>Reviews</span>
                                      <span>{productDetails[similarProduct.link || '']?.review_count}</span>
                                    </div>
                                  )}
                                  {productDetails[similarProduct.link || '']?.availability && (
                                    <div className="flex justify-between">
                                      <span>Stock</span>
                                      <span className={`font-medium ${
                                        productDetails[similarProduct.link || '']?.availability.toLowerCase().includes('in stock') 
                                          ? 'text-green-600' 
                                          : 'text-red-600'
                                      }`}>
                                        {productDetails[similarProduct.link || '']?.availability}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Reviews */}
                              {productDetails[similarProduct.link || '']?.reviews && 
                               Array.isArray(productDetails[similarProduct.link || '']?.reviews) && 
                               (productDetails[similarProduct.link || '']?.reviews || []).length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold mb-1">Reviews</h4>
                                  <div className="space-y-2">
                                    {(productDetails[similarProduct.link || '']?.reviews || []).map((review, idx) => (
                                      <div key={idx} className="text-xs text-gray-700">
                                        <div className="flex items-center gap-1 mb-1">
                                          <span className="font-medium">{review.username || 'Anonymous'}</span>
                                          <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`h-3 w-3 ${i < Math.floor(parseFloat(review.rating || '0')) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        <p className="line-clamp-2">{review.review || 'No review text available'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Buy Now Button */}
                              <div className="mt-4 flex gap-2">
                                <Button
                                  className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 h-8 text-sm"
                                  onClick={() => window.open(similarProduct.link, '_blank')}
                                >
                                  <ShoppingBag className="h-3 w-3 mr-1" />
                                  Buy Now
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="flex-1 h-8 text-sm"
                                  onClick={() => {
                                    const details = productDetails[similarProduct.link || ''];
                                    const available = details?.availability?.toLowerCase().includes('in stock') || false;
                                    setIsAvailable(available);
                                    setShowAlertModal(true);
                                    // Store the similar product temporarily to use in handleAlertConfirm
                                    setTempProduct(similarProduct);
                                  }}
                                >
                                  <Heart className="h-3 w-3 mr-1" />
                                  Wishlist
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Alert Preferences Modal */}
      {showAlertModal && (
        <AlertPreferencesModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          onConfirm={handleAlertConfirm}
          productTitle={tempProduct?.title || product.title}
          isAvailable={isAvailable}
          currentPrice={tempProduct?.price || product.price}
        />
      )}
    </div>
  );
};

export default ProductDetailsPage; 
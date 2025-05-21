import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Heart, ShoppingBag, Clock, Share2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Product } from '../App';
import AlertPreferencesModal from './AlertPreferencesModal';
import { AIService } from '../../services/ai_service';

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

interface GPT41Recommendation {
  title: string;
  website: string;
  price: string;
  explanation: string;
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
  const [gptRecommendation, setGptRecommendation] = useState<GPT41Recommendation | null>(null);
  const [isRecommendationExpanded, setIsRecommendationExpanded] = useState(false);

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
        
        // Create JSON objects for console logging
        const formattedProducts = validProducts.map((product, index) => {
          const productData = responses[index]?.data || {} as any;
          const productReviews = responses[index]?.reviews || [];
          
          return {
            title: productData.title || product.title || '',
            description: productData.description || product.description || '',
            price: productData.price || product.price || '',
            image: productData.image || product.image || '',
            website: productData.website || product.website || '',
            original_price: productData.original_price || (product as any).original_price || '',
            discount_percentage: productData.discount_percentage || (product as any).discount_percentage || '',
            currency: productData.currency || (product as any).currency || '',
            availability: productData.availability || product.availability || '',
            rating: productData.rating || product.rating || '',
            review_count: productData.review_count || (product as any).review_count || '',
            sku: productData.sku || product.sku || '',
            brand: productData.brand || product.brand || '',
            top_customer_reviews: productReviews.map(review => ({
              username: review.username || 'Anonymous',
              review: review.review || '',
              rating: review.rating || 0
            }))
          };
        });
        
        // Add the current product to the formatted products array
        const currentProductFormatted = {
          title: product.title || '',
          description: product.description || '',
          price: product.price || '',
          image: product.image || '',
          website: product.website || '',
          original_price: (product as any).original_price || '',
          discount_percentage: (product as any).discount_percentage || '',
          currency: (product as any).currency || '',
          availability: product.availability || '',
          rating: product.rating || '',
          review_count: (product as any).review_count || '',
          sku: product.sku || '',
          brand: product.brand || '',
          top_customer_reviews: Array.isArray(product.reviews) 
            ? (product.reviews as any[]).map(review => ({
                username: review.username || 'Anonymous',
                review: review.review || '',
                rating: review.rating || 0
              }))
            : []
        };
        
        // Add the current product at the beginning of the array
        const allProducts = [currentProductFormatted, ...formattedProducts];
        
        // Log the complete product data as a JSON string
        console.log('All product data:');
        console.log(JSON.stringify(allProducts, null, 2));
        
        // Pass the formatted product data to GPT-4.1 and log the response
        const aiService = new AIService();
        try {
          const gptResponse = await aiService.askGPT41(JSON.stringify(allProducts));
          console.log('GPT-4.1 Recommendation:');
          console.log(gptResponse);
          
          // Parse the GPT-4.1 response to extract recommendation details
          try {
            const titleMatch = gptResponse.match(/\*\*Title:\*\*\s*(.*?)(?:\s*\n|\s*\*\*Website)/i);
            const websiteMatch = gptResponse.match(/\*\*Website:\*\*\s*(.*?)(?:\s*\n|\s*\*\*Final)/i);
            const priceMatch = gptResponse.match(/\*\*Final Price:\*\*\s*(.*?)(?:\s*\n|\s*\*\*Explanation)/i);
            const explanationMatch = gptResponse.match(/\*\*Explanation:\*\*\s*([\s\S]*?)(?:\s*$)/i);
            
            if (titleMatch && websiteMatch && priceMatch && explanationMatch) {
              setGptRecommendation({
                title: titleMatch[1].trim(),
                website: websiteMatch[1].trim(),
                price: priceMatch[1].trim(),
                explanation: explanationMatch[1].trim()
              });
            }
          } catch (parseError) {
            console.error('Error parsing GPT-4.1 recommendation:', parseError);
          }
        } catch (aiError) {
          console.error('Error getting GPT-4.1 recommendation:', aiError);
        }
        
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
  const formatPrice = (price: string | number, currency?: string) => {
    if (typeof price === 'string') {
      // Check if price already includes a currency symbol
      if (price.includes('$') || price.includes('€') || price.includes('£')) {
        return price;
      }
      const numericPrice = parseFloat(price);
      if (!isNaN(numericPrice)) {
        // Display the currency code if available, otherwise use USD
        const currencyCode = currency || 'USD';
        return `${currencyCode} ${numericPrice.toFixed(2)} `;
      }
      return price;
    }
    
    // For numeric prices, use the currency code
    const currencyCode = currency || 'USD';
    return `${price.toFixed(2)} ${currencyCode}`;
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
              {product.rating ? (
                // If we have a rating, display the appropriate number of filled stars
                [...Array(5)].map((_, i) => {
                  const ratingValue = typeof product.rating === 'string' ? 
                    parseFloat(product.rating) : 
                    (typeof product.rating === 'number' ? product.rating : 0);
                  
                  return (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < Math.floor(ratingValue) ? 
                        "fill-amber-400 text-amber-400" : 
                        (i < ratingValue && i >= Math.floor(ratingValue) ? 
                          "fill-amber-200 text-amber-200" : 
                          "text-gray-300")}`} 
                    />
                  );
                })
              ) : (
                // If no rating, show empty stars
                [...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-gray-300" />
                ))
              )}
              <span className="text-xs text-gray-500 ml-1">
                {product.review_count ? 
                  `(${product.review_count} reviews)` : 
                  (Array.isArray(product.reviews) && product.reviews.length > 0 ? 
                    `(${product.reviews.length} reviews)` : 
                    '(N/A)')}
              </span>
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
                <div className="text-lg font-bold text-sky-600">{formatPrice(product.price, product.currency)}</div>
                {product.target && (
                  <div className="flex items-center text-xs">
                    <span className="text-gray-500">Target: {formatPrice(product.target, product.currency)}</span>
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
                  <>
                    {/* AI Recommendation Section */}
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                            </svg>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900">ShopBot's Choice</h3>
                          <Badge variant="outline" className="ml-auto bg-white/50 text-indigo-600 border-indigo-200">
                            AI Powered
                          </Badge>
                        </div>

                        {gptRecommendation ? (
                        <div className="space-y-3">
                            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all cursor-pointer" 
                                  onClick={() => setIsRecommendationExpanded(!isRecommendationExpanded)}>
                              <CardContent className="p-3">
                                <div className="flex gap-3">
                                  <div className="relative h-20 w-20 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-indigo-100">
                                    {similarProducts.length > 0 && similarProducts[0].image && (
                                      <img
                                        src={similarProducts[0].image || "/placeholder.svg"}
                                        alt={gptRecommendation.title}
                                        className="object-contain h-full"
                                      />
                                    )}
                                    <div className="absolute -top-1 -right-1">
                                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-1.5 py-0.5">
                                        Best Value
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                          {gptRecommendation.title}
                                        </h4>
                                        <div className="text-xs text-gray-600 mt-1">
                                          {gptRecommendation.website}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 -mt-1 -mr-1"
                                      >
                                        {isRecommendationExpanded ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                      <div>
                                        <div className="text-sm font-bold text-indigo-600">
                                          {gptRecommendation.price}
                                        </div>
                                      </div>
                                      <Button
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-8 text-sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const matchedProduct = similarProducts.find(p => 
                                            p.title?.includes(gptRecommendation.title.substring(0, 30)) || 
                                            gptRecommendation.title.includes(p.title?.substring(0, 30) || '')
                                          );
                                          if (matchedProduct?.link) {
                                            window.open(matchedProduct.link, '_blank');
                                          }
                                        }}
                                      >
                                        <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                                        Buy Now
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Expandable explanation */}
                                {isRecommendationExpanded && (
                                  <div className="mt-3 pt-3 border-t border-indigo-100">
                                    <h5 className="text-xs font-semibold text-gray-700 mb-1">Why we recommend this:</h5>
                                    <p className="text-xs text-gray-600">{gptRecommendation.explanation}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Fallback to first similar product if GPT recommendation is not available */}
                            {similarProducts.slice(0, 1).map((product, index) => (
                              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                              <CardContent className="p-3">
                                <div className="flex gap-3">
                                  <div className="relative h-20 w-20 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-indigo-100">
                                    <img
                                      src={product.image || "/placeholder.svg"}
                                      alt={product.title}
                                      className="object-contain h-full"
                                    />
                                    <div className="absolute -top-1 -right-1">
                                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-1.5 py-0.5">
                                        Best Value
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                          {product.title}
                                        </h4>
                                        <div className="flex items-center gap-1 mt-1">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-3 w-3 ${i < (product.rating ? Math.floor(parseFloat(product.rating)) : 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                      <div>
                                        <div className="text-sm font-bold text-indigo-600">
                                          {product.price}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Best price among {similarProducts.length} options
                                        </div>
                                      </div>
                                      <Button
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-8 text-sm"
                                        onClick={() => window.open(product.link, '_blank')}
                                      >
                                        <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                                        Buy Now
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {gptRecommendation ? 'AI-powered analysis based on ratings, reviews, and pricing' : 'Based on price, ratings, and availability analysis'}
                        </div>
                      </div>
                    </div>

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
                  </>
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
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Check, ChevronDown, ChevronUp, ExternalLink, Heart, Info, Loader2, Scan, X, Search, Sparkles } from "lucide-react"
import { Button } from "@/entrypoints/popup/components/ui/button"
import { Card, CardContent } from "@/entrypoints/popup/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/entrypoints/popup/components/ui/tabs"
import { Badge } from "@/entrypoints/popup/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/entrypoints/popup/components/ui/dialog"
import { Input } from "@/entrypoints/popup/components/ui/input"
import { Label } from "@/entrypoints/popup/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/entrypoints/popup/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/entrypoints/popup/components/ui/tooltip"
import browser from 'webextension-polyfill'

// Mock data for product comparison
const mockProductData = {
  currentSite: {
    name: "Example Store",
    price: 199.99,
    shipping: "Free",
    availability: "In Stock", // Can be "In Stock" or "Out of Stock"
    rating: 4.5,
    url: "#",
  },
  alternatives: [
    {
      site: "BestDeals",
      price: 189.99,
      shipping: "$4.99",
      availability: "In Stock",
      rating: 4.3,
      url: "#",
    },
    {
      site: "TechGiant",
      price: 209.99,
      shipping: "Free",
      availability: "In Stock",
      rating: 4.7,
      url: "#",
    },
    {
      site: "AudioWorld",
      price: 179.99,
      shipping: "$7.99",
      availability: "Ships in 2-3 days",
      rating: 4.2,
      url: "#",
    },
  ],
}

export default function ProductScanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [productFound, setProductFound] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [inWishlist, setInWishlist] = useState(false)
  const [expandedComparison, setExpandedComparison] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Absolute fail-safe to ensure scanner can never open if not logged in
  const secureIsOpen = isLoggedIn && isOpen;

  // New state for wishlist modal
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false)
  const [alertType, setAlertType] = useState("price") // "price" or "availability"
  const [alertPrice, setAlertPrice] = useState("")

  // For demo purposes, let's add a state to toggle product availability
  const [isProductAvailable, setIsProductAvailable] = useState(true)

  // Check if user is logged in when the component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsCheckingAuth(true);
      try {
        console.log("Checking authentication status...");
        const response = await browser.runtime.sendMessage({
          action: 'checkAuthStatus'
        }) as { success: boolean; data?: { isAuthenticated: boolean } };
        
        console.log("Auth response:", response);
        
        // More strict authentication check
        const isAuthenticated = 
          response?.success === true && 
          response?.data !== undefined && 
          response?.data?.isAuthenticated === true;
        
        console.log("Is authenticated:", isAuthenticated);
        setIsLoggedIn(isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleScan = () => {
    // Only proceed if the user is logged in
    if (!isLoggedIn) return;

    setIsOpen(true)
    setIsScanning(true)
    setProductFound(false)

    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false)
      setProductFound(true)
    }, 100)
  }

  // Reset isOpen to false if user is not logged in
  useEffect(() => {
    if (!isLoggedIn && isOpen) {
      setIsOpen(false);
    }
  }, [isLoggedIn, isOpen]);

  const openWishlistModal = () => {
    setAlertPrice(mockProductData.currentSite.price.toString())
    setAlertType(isProductAvailable ? "price" : "availability")
    setIsWishlistModalOpen(true)
  }

  const handleAddToWishlist = () => {
    setInWishlist(true)
    setIsWishlistModalOpen(false)
  }

  return (
    <>
      {/* Enhanced Floating action button */}
      <div 
        className={`fixed ${isOpen ? 'bottom-6 right-6 scale-100 opacity-100' : 'bottom-6 right-6 scale-100 opacity-100'} transition-all duration-300 z-50`}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={(e) => {
                    // Prevent any action if not logged in
                    if (!isLoggedIn) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    
                    if (isOpen) {
                      setIsOpen(false);
                    } else {
                      handleScan();
                    }
                  }}
                  className={`
                    group relative overflow-hidden rounded-full shadow-lg 
                    ${isOpen 
                      ? "w-14 h-14 bg-rose-500 hover:bg-rose-600" 
                      : "px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    }
                    transition-all duration-300 ease-in-out
                    ${!isLoggedIn ? "opacity-70 pointer-events-none cursor-not-allowed" : ""}
                  `}
                  size={isOpen ? "icon" : "default"}
                  disabled={!isLoggedIn || isCheckingAuth}
                  aria-disabled={!isLoggedIn || isCheckingAuth}
                >
                  {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                  ) : (
                    <>
                      <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-transparent transition-colors duration-300"></div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-white animate-pulse-scale" />
                        <span className="font-medium text-white">Find Similar Products</span>
                      </div>
                      <div className="absolute -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {!isLoggedIn && !isOpen && (
              <TooltipContent className="p-2 bg-gray-800 text-white text-xs rounded">
                <p>You must be logged in to use this feature</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Product scanner popup with enhanced animation */}
      {secureIsOpen && (
        <div 
          className="fixed bottom-24 right-6 w-[90vw] max-w-sm sm:max-w-md mx-auto left-0 sm:left-auto sm:mx-0 z-40 animate-float-in"
        >
          <Card className="shadow-xl border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50"></div>
            <CardContent className="p-0 relative">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Product Scanner</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isScanning && (
                <div className="p-8 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-gray-600 animate-spin mb-4" />
                  <p className="text-gray-600">Scanning current page for product information...</p>
                </div>
              )}

              {!isScanning && !productFound && (
                <div className="p-8 flex flex-col items-center justify-center">
                  <Info className="h-8 w-8 text-gray-600 mb-4" />
                  <p className="text-gray-600 text-center mb-4">
                    Click the scan button to analyze the current page for product information.
                  </p>
                  <Button onClick={handleScan}>
                    <Scan className="h-4 w-4 mr-2" />
                    Scan for Products
                  </Button>
                </div>
              )}

              {!isScanning && productFound && (
                <div className="max-h-[80vh] overflow-y-auto">
                  <div className="p-3">
                    {/* Product Information Section - Completely Redesigned */}
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-50 rounded-xl shadow-lg p-5 mb-4 border border-blue-200 transform transition-all duration-300 hover:scale-[1.01]">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Product Image */}
                        <div className="w-full md:w-1/4 bg-white p-3 rounded-lg shadow-inner flex items-center justify-center">
                          <img
                            src="/placeholder.svg?height=120&width=120"
                            alt="Premium Wireless Headphones"
                            className="w-24 h-24 md:w-32 md:h-32 object-contain"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="w-full md:w-3/4">
                          {/* Brand & Title */}
                          <div className="mb-2">
                            <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">SoundMaster</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Premium Wireless Headphones</h3>
                          </div>
                          
                          {/* Status Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge
                              className={
                                isProductAvailable
                                  ? "bg-green-100 text-green-800 border-0 px-3 py-1 rounded-full font-medium"
                                  : "bg-red-100 text-red-800 border-0 px-3 py-1 rounded-full font-medium"
                              }
                            >
                              {isProductAvailable ? "In Stock" : "Out of Stock"}
                            </Badge>
                            <Badge className="bg-indigo-100 text-indigo-800 border-0 px-3 py-1 rounded-full font-medium">
                              Brand
                            </Badge>
                          </div>
                          
                          {/* Price Section */}
                          <div className="flex items-baseline gap-2 bg-white p-2 rounded-lg inline-block">
                            <span className="text-2xl font-bold text-blue-600">$199.99</span>
                            <span className="text-sm text-gray-500 line-through">$249.99</span>
                            <Badge className="bg-rose-500 text-white font-semibold rounded-full px-2 py-0.5">
                              -20%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <Button
                        variant={inWishlist ? "default" : "outline"}
                        className={inWishlist ? "bg-rose-500 hover:bg-rose-600 w-full" : "w-full"}
                        onClick={openWishlistModal}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${inWishlist ? "fill-white" : ""}`} />
                        {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                      </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="compare">Compare</TabsTrigger>
                      </TabsList>

                      <TabsContent value="details" className="mt-0">
                        <div className="space-y-3">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              Experience crystal-clear sound with our premium wireless headphones. Featuring active noise
                              cancellation, 30-hour battery life, and comfortable over-ear design for all-day listening.
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Specifications</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-blue-50 rounded-lg p-2.5">
                                <span className="text-xs font-medium text-blue-500 block mb-1">Brand</span>
                                <span className="font-medium text-gray-900">SoundMaster</span>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-2.5">
                                <span className="text-xs font-medium text-blue-500 block mb-1">Model</span>
                                <span className="font-medium text-gray-900">SM-500</span>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-2.5">
                                <span className="text-xs font-medium text-blue-500 block mb-1">Color</span>
                                <span className="font-medium text-gray-900">Black</span>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-2.5">
                                <span className="text-xs font-medium text-blue-500 block mb-1">Connectivity</span>
                                <span className="font-medium text-gray-900">Bluetooth 5.0</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            variant="default" 
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                            size="sm"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Example Store
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="compare" className="mt-0">
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2 shadow-sm">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="font-medium">We found this product on 3 other websites</span>
                          </div>

                          <div className={`space-y-3 ${expandedComparison ? '' : 'comparison-collapsed'}`}>
                            {/* Current site - Redesigned */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-semibold text-gray-900">Example Store (Current)</div>
                                <Badge className="bg-blue-500 text-white border-0 px-2.5 py-0.5 rounded-full font-medium">
                                  Current
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-600">Price:</span>
                                  <span className="font-bold text-blue-600">${mockProductData.currentSite.price}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-600">Shipping:</span>
                                  <span className="font-medium">{mockProductData.currentSite.shipping}</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <h4 className="text-xs font-medium text-gray-700 mb-1">Customer Reviews</h4>
                                <div className="flex items-center">
                                  <div className="flex text-yellow-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <svg key={i} className={`w-3 h-3 ${i < Math.floor(mockProductData.currentSite.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="ml-1 text-xs text-gray-600">{mockProductData.currentSite.rating} (24 reviews)</span>
                                </div>
                              </div>
                            </div>

                            {/* Best alternative - Redesigned */}
                            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-semibold text-gray-900">AudioWorld</div>
                                <Badge className="bg-green-500 text-white border-0 px-2.5 py-0.5 rounded-full font-medium">
                                  Best Price
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-600">Price:</span>
                                  <span className="font-bold text-green-600">${mockProductData.alternatives[2].price}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-600">Shipping:</span>
                                  <span className="font-medium">{mockProductData.alternatives[2].shipping}</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <h4 className="text-xs font-medium text-gray-700 mb-1">Customer Reviews</h4>
                                <div className="flex items-center">
                                  <div className="flex text-yellow-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <svg key={i} className={`w-3 h-3 ${i < Math.floor(mockProductData.alternatives[2].rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="ml-1 text-xs text-gray-600">{mockProductData.alternatives[2].rating} (18 reviews)</span>
                                </div>
                              </div>
                              <div className="mt-3">
                                <Button size="sm" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0">
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  Visit Store
                                </Button>
                              </div>
                            </div>

                            {/* Show more/less button - Redesigned */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-gray-700 border-gray-300 hover:bg-gray-50 font-medium"
                              onClick={() => {
                                // Toggle expanded state and ensure content is properly hidden
                                setExpandedComparison(!expandedComparison);
                                // Add a small delay to ensure any animations have time to complete
                                if (expandedComparison) {
                                  setTimeout(() => {
                                    // Force a re-render to ensure the collapse is complete
                                    setExpandedComparison(false);
                                  }, 10);
                                }
                              }}
                            >
                              {expandedComparison ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Show More (2)
                                </>
                              )}
                            </Button>

                            {/* Additional alternatives - Only show when expanded */}
                            {expandedComparison && (
                              <div className="space-y-3 animate-fade-in">
                                {mockProductData.alternatives.slice(0, 2).map((alt, index) => (
                                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="font-semibold text-gray-900">{alt.site}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div className="flex flex-col">
                                        <span className="text-xs text-gray-600">Price:</span>
                                        <span className="font-bold text-gray-800">${alt.price}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs text-gray-600">Shipping:</span>
                                        <span className="font-medium">{alt.shipping}</span>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <h4 className="text-xs font-medium text-gray-700 mb-1">Customer Reviews</h4>
                                      <div className="flex items-center">
                                        <div className="flex text-yellow-500">
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <svg key={i} className={`w-3 h-3 ${i < Math.floor(alt.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                          ))}
                                        </div>
                                        <span className="ml-1 text-xs text-gray-600">{alt.rating} ({index === 0 ? "15" : "20"} reviews)</span>
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <Button variant="outline" size="sm" className="w-full text-gray-700 hover:bg-gray-100">
                                        Visit Store
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wishlist Modal */}
      <Dialog open={isWishlistModalOpen} onOpenChange={setIsWishlistModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Wishlist</DialogTitle>
            <DialogDescription>
              {isProductAvailable
                ? "Set a price alert for this product"
                : "Get notified when this product becomes available"}
            </DialogDescription>
          </DialogHeader>

          {isProductAvailable ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="price-alert">Notify me when price drops below:</Label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <Input
                    id="price-alert"
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    className="flex-1"
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-sm text-gray-500">Current price: ${mockProductData.currentSite.price}</p>
              </div>

              <RadioGroup defaultValue="email" className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="notification-email" />
                  <Label htmlFor="notification-email">Email notification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="browser" id="notification-browser" />
                  <Label htmlFor="notification-browser">Browser notification</Label>
                </div>
              </RadioGroup>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-sm">
                This product is currently out of stock. We'll notify you as soon as it becomes available.
              </p>

              <RadioGroup defaultValue="email" className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="notification-email" />
                  <Label htmlFor="notification-email">Email notification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="browser" id="notification-browser" />
                  <Label htmlFor="notification-browser">Browser notification</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsWishlistModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToWishlist} className="bg-rose-500 hover:bg-rose-600">
              <Heart className="h-4 w-4 mr-2" />
              Add to Wishlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* For demo purposes - toggle product availability */}
      <div className="fixed bottom-6 left-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsProductAvailable(!isProductAvailable)}
          className="bg-white"
        >
          Toggle {isProductAvailable ? "Out of Stock" : "In Stock"}
        </Button>
      </div>
    </>
  )
}

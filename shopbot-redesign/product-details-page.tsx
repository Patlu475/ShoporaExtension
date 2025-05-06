"use client"

import { ArrowLeft, Bell, Clock, Heart, Home, MessageSquare, Share2, ShoppingBag, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useState } from "react"

interface ProductDetailsPageProps {
  navigateTo: (page: string) => void
}

export default function ProductDetailsPage({ navigateTo }: ProductDetailsPageProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const productImages = [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ]

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-400 to-sky-400 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => navigateTo("home")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-bold text-white">Product Details</h1>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="pb-16">
          {/* Product Image Gallery */}
          <div className="relative bg-gray-50 p-4">
            <div className="relative h-48 mx-auto w-full flex items-center justify-center">
              <Image
                src={productImages[activeImageIndex] || "/placeholder.svg"}
                alt="Product"
                width={200}
                height={200}
                className="object-contain h-full"
              />

              <button
                className={`absolute top-0 right-2 p-2 rounded-full ${isWishlisted ? "bg-pink-100 text-pink-500" : "bg-white/80 text-gray-500 hover:bg-white"} shadow-sm`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-pink-500 text-pink-500" : ""}`} />
              </button>
            </div>

            {/* Image Thumbnails */}
            <div className="flex justify-center gap-2 mt-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`w-12 h-12 rounded-md overflow-hidden border-2 ${activeImageIndex === idx ? "border-teal-500" : "border-transparent"}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Thumbnail ${idx + 1}`}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="flex gap-1 mb-2">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <Star className="h-4 w-4 text-gray-300" />
              <span className="text-xs text-gray-500 ml-1">(245 reviews)</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900">Aroma Professional Rice Cooker</h2>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500">by</span>
              <span className="text-sm font-medium ml-1">Aroma Housewares</span>
              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                Verified Brand
              </Badge>
            </div>

            {/* Price and Stock */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-sky-600">$19.57</div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 line-through">$24.99</span>
                  <Badge className="ml-2 bg-green-500">-22% OFF</Badge>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="text-sm mb-1 bg-teal-50 text-teal-700 border-teal-200">
                  Best Price
                </Badge>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs text-green-700">In Stock</span>
                </div>
              </div>
            </div>

            {/* Retailers */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="text-sm font-medium">Available from 3 retailers</div>
              <div className="flex gap-2">
                <Card className="flex-1 cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Image src="/placeholder.svg" alt="Amazon" width={16} height={16} />
                      </div>
                      <span className="text-sm font-medium">Amazon</span>
                    </div>
                    <div className="text-sm text-sky-600 font-semibold">$19.57</div>
                  </CardContent>
                </Card>
                <Card className="flex-1 cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Image src="/placeholder.svg" alt="Walmart" width={16} height={16} />
                      </div>
                      <span className="text-sm font-medium">Walmart</span>
                    </div>
                    <div className="text-sm text-gray-700 font-semibold">$22.99</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigateTo("wishlist")}>
                Add to Wishlist
                <Heart className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Button
              variant="secondary"
              className="mt-2 w-full flex items-center justify-center"
              onClick={() => navigateTo("wishlist")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Set Price Alert
            </Button>
          </div>

          <Separator className="my-2" />

          {/* Tabs for Details, Specs, Reviews */}
          <div className="px-4">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="similar">Similar</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-700">
                    The Aroma Professional Rice Cooker makes restaurant-quality rice at the touch of a button. Features
                    include programmable digital controls, automatic keep-warm, and a steam tray for vegetables and
                    more.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Key Features</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>6-cup cooked capacity</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>One-touch operation</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>Automatic keep-warm function</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>Non-stick inner cooking pot</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Model</span>
                    <span className="text-sm font-medium">ARC-6106</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Capacity</span>
                    <span className="text-sm font-medium">6 cups (cooked)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Power</span>
                    <span className="text-sm font-medium">120V, 60Hz</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Wattage</span>
                    <span className="text-sm font-medium">300W</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Dimensions</span>
                    <span className="text-sm font-medium">8.5" x 9" x 8.7"</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Weight</span>
                    <span className="text-sm font-medium">2.45 lbs</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Warranty</span>
                    <span className="text-sm font-medium">1 Year Limited</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">4.2</div>
                    <div className="flex gap-1 justify-center">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                      <Star className="h-3 w-3 text-gray-300" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">245 reviews</div>
                  </div>

                  <div className="flex-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs w-6">5★</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <div className="text-xs text-gray-500">65%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs w-6">4★</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: "20%" }}></div>
                        </div>
                        <div className="text-xs text-gray-500">20%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs w-6">3★</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: "10%" }}></div>
                        </div>
                        <div className="text-xs text-gray-500">10%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs w-6">2★</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: "3%" }}></div>
                        </div>
                        <div className="text-xs text-gray-500">3%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs w-6">1★</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full" style={{ width: "2%" }}></div>
                        </div>
                        <div className="text-xs text-gray-500">2%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample reviews */}
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Sarah T.</h4>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Verified Purchase • 2 months ago</p>
                    <p className="text-sm mt-2">
                      Perfect rice every time! This cooker is so easy to use and clean. The automatic keep-warm function
                      is really convenient.
                    </p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Mike R.</h4>
                      <div className="flex gap-0.5">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                        <Star className="h-3 w-3 text-gray-300" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Verified Purchase • 1 month ago</p>
                    <p className="text-sm mt-2">
                      Good value for the price. The rice comes out well, though the measuring cup is a bit small. Would
                      buy again.
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Read All Reviews
                </Button>
              </TabsContent>
              <TabsContent value="similar" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Similar Product Card 1 */}
                  <Card
                    className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateTo("product-details")}
                  >
                    <CardContent className="p-0">
                      <div className="h-28 bg-gray-50 relative flex items-center justify-center">
                        <Image src="/placeholder.svg" alt="Product" width={80} height={80} className="object-contain" />
                        <Badge className="absolute top-2 right-2 bg-amber-500 text-xs">Sale</Badge>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm line-clamp-2">Zojirushi NS-LGC05 Rice Cooker</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-sm font-semibold text-sky-600">$139.99</div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <Heart className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Similar Product Card 2 */}
                  <Card
                    className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateTo("product-details")}
                  >
                    <CardContent className="p-0">
                      <div className="h-28 bg-gray-50 relative flex items-center justify-center">
                        <Image src="/placeholder.svg" alt="Product" width={80} height={80} className="object-contain" />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm line-clamp-2">Instant Pot Zest 8 Cup Rice Cooker</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            <Star className="h-3 w-3 text-gray-300" />
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-sm font-semibold text-sky-600">$29.99</div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <Heart className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Similar Product Card 3 */}
                  <Card
                    className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateTo("product-details")}
                  >
                    <CardContent className="p-0">
                      <div className="h-28 bg-gray-50 relative flex items-center justify-center">
                        <Image src="/placeholder.svg" alt="Product" width={80} height={80} className="object-contain" />
                        <Badge className="absolute top-2 right-2 bg-teal-500 text-xs">Best Seller</Badge>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm line-clamp-2">Hamilton Beach Rice Cooker</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            <Star className="h-3 w-3 text-gray-300" />
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-sm font-semibold text-sky-600">$24.99</div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <Heart className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Similar Product Card 4 */}
                  <Card
                    className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateTo("product-details")}
                  >
                    <CardContent className="p-0">
                      <div className="h-28 bg-gray-50 relative flex items-center justify-center">
                        <Image src="/placeholder.svg" alt="Product" width={80} height={80} className="object-contain" />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm line-clamp-2">Dash Mini Rice Cooker</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {[...Array(3)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            {[...Array(2)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-gray-300" />
                            ))}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-sm font-semibold text-sky-600">$19.99</div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <Heart className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" size="sm" className="text-sm">
                    View All Similar Products
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Separator className="my-4" />

          {/* Similar Products */}
          <div className="px-4">
            <h3 className="text-sm font-semibold mb-3">You May Also Like</h3>
            <div className="flex overflow-x-auto gap-3 pb-4 -mx-1 px-1">
              {/* Similar Product Card 1 */}
              <Card
                className="min-w-[180px] border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateTo("product-details")}
              >
                <CardContent className="p-0">
                  <div className="h-28 bg-gray-50 relative flex items-center justify-center">
                    <Image src="/placeholder.svg" alt="Product" width={80} height={80} className="object-contain" />
                    <Badge className="absolute top-2 right-2 bg-amber-500 text-xs">Sale</Badge>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2">Zojirushi NS-LGC05 Rice Cooker</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-sm font-semibold text-sky-600">$139.99</div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <Heart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Product Card 2 */}
              <Card
                className="min-w-[180px] border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateTo("product-details")}
              >
                <CardContent className="p-0">
                  <div className="h-28 bg-gray-50 relative flex items-center justify-center">
                    <Image src="/placeholder.svg" alt="Product" width={80} height={80} className="object-contain" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2">Instant Pot Zest 8 Cup Rice Cooker</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                        <Star className="h-3 w-3 text-gray-300" />
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-sm font-semibold text-sky-600">$29.99</div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <Heart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Product Card 3 */}
              <Card
                className="min-w-[180px] border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateTo("product-details")}
              >
                <CardContent className="p-0">
                  <div className="h-28 bg-gray-50 relative flex items-center justify-center">
                    <Image src="/placeholder.svg" alt="Product" width={80} height={80} className="object-contain" />
                    <Badge className="absolute top-2 right-2 bg-teal-500 text-xs">Best Seller</Badge>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2">Hamilton Beach Rice Cooker</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                        <Star className="h-3 w-3 text-gray-300" />
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-sm font-semibold text-sky-600">$24.99</div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <Heart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="border-t bg-white fixed bottom-0 w-[400px]">
        <div className="flex items-center justify-around p-2">
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => navigateTo("home")}>
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => navigateTo("wishlist")}>
            <Heart className="h-5 w-5" />
            <span className="sr-only">Favorites</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => navigateTo("notifications")}>
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => navigateTo("profile")}>
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

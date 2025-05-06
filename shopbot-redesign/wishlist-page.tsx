"use client"

import { Bell, ChevronRight, Clock, Heart, Home, MoreHorizontal, Plus, ShoppingCart, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WishlistPageProps {
  navigateTo: (page: string) => void
}

export default function WishlistPage({ navigateTo }: WishlistPageProps) {
  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-400 to-sky-400 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">My Wishlist</h1>
            <p className="text-sm text-white/90 mt-1">Track your favorite products</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/20 text-white hover:bg-white/30">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add item</span>
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-3 mt-2">
              <TabsTrigger value="all">All (3)</TabsTrigger>
              <TabsTrigger value="price-alerts">Price Alerts</TabsTrigger>
              <TabsTrigger value="in-stock">In Stock</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[calc(600px-140px)]">
              <div className="p-4 space-y-4">
                {/* Product Card 1 */}
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="h-32 bg-gray-50 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg"
                          alt="Rice Cooker"
                          width={100}
                          height={100}
                          className="object-contain h-24 w-auto cursor-pointer"
                          onClick={() => navigateTo("product-details")}
                        />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-teal-500 hover:bg-teal-600">Best Price</Badge>
                    </div>

                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <h3
                          className="font-medium text-sm line-clamp-2 cursor-pointer"
                          onClick={() => navigateTo("product-details")}
                        >
                          Aroma Housewares 6-cup Rice Cooker
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              <span>Buy Now</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Set Price Alert</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <div className="text-sky-600 font-semibold">$19.57</div>
                          <div className="flex items-center mt-1">
                            <div className="text-xs text-gray-500">Target: $20.00</div>
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs h-5 bg-green-50 text-green-700 border-green-200"
                            >
                              -2.2%
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-teal-500 hover:bg-teal-600 h-8"
                          onClick={() => navigateTo("product-details")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-xs text-green-700">In Stock</span>
                        </div>
                        <span className="text-xs text-gray-500">Amazon</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Card 2 */}
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="h-32 bg-gray-50 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg"
                          alt="Headphones"
                          width={100}
                          height={100}
                          className="object-contain h-24 w-auto cursor-pointer"
                          onClick={() => navigateTo("product-details")}
                        />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600">Sale</Badge>
                    </div>

                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <h3
                          className="font-medium text-sm line-clamp-2 cursor-pointer"
                          onClick={() => navigateTo("product-details")}
                        >
                          Sony WH-1000XM4 Wireless Noise Canceling Headphones
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              <span>Buy Now</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Set Price Alert</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <div className="text-sky-600 font-semibold">$248.00</div>
                          <div className="flex items-center mt-1">
                            <div className="text-xs text-gray-500">Target: $230.00</div>
                            <Badge variant="outline" className="ml-2 text-xs h-5 bg-red-50 text-red-700 border-red-200">
                              +7.8%
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-teal-500 hover:bg-teal-600 h-8"
                          onClick={() => navigateTo("product-details")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-xs text-green-700">In Stock</span>
                        </div>
                        <span className="text-xs text-gray-500">Best Buy</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Card 3 */}
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="h-32 bg-gray-50 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg"
                          alt="Coffee Maker"
                          width={100}
                          height={100}
                          className="object-contain h-24 w-auto cursor-pointer"
                          onClick={() => navigateTo("product-details")}
                        />
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <h3
                          className="font-medium text-sm line-clamp-2 cursor-pointer"
                          onClick={() => navigateTo("product-details")}
                        >
                          Keurig K-Elite Coffee Maker, Single Serve K-Cup Pod
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              <span>Buy Now</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Set Price Alert</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <div className="text-sky-600 font-semibold">$129.99</div>
                          <div className="flex items-center mt-1">
                            <div className="text-xs text-gray-500">Target: $120.00</div>
                            <Badge variant="outline" className="ml-2 text-xs h-5 bg-red-50 text-red-700 border-red-200">
                              +8.3%
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-teal-500 hover:bg-teal-600 h-8"
                          onClick={() => navigateTo("product-details")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                          <span className="text-xs text-amber-700">Low Stock</span>
                        </div>
                        <span className="text-xs text-gray-500">Target</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="price-alerts" className="mt-0">
            <div className="h-[calc(600px-140px)] flex items-center justify-center flex-col p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No price alerts</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Set price alerts to get notified when prices drop below your target
              </p>
              <Button className="mt-4 bg-teal-500 hover:bg-teal-600">Set a Price Alert</Button>
            </div>
          </TabsContent>

          <TabsContent value="in-stock" className="mt-0">
            <ScrollArea className="h-[calc(600px-140px)]">
              <div className="p-4 space-y-4">
                {/* In stock items would go here - showing the same items for demo */}
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="h-32 bg-gray-50 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg"
                          alt="Rice Cooker"
                          width={100}
                          height={100}
                          className="object-contain h-24 w-auto cursor-pointer"
                          onClick={() => navigateTo("product-details")}
                        />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-teal-500 hover:bg-teal-600">Best Price</Badge>
                    </div>

                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <h3
                          className="font-medium text-sm line-clamp-2 cursor-pointer"
                          onClick={() => navigateTo("product-details")}
                        >
                          Aroma Housewares 6-cup Rice Cooker
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              <span>Buy Now</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Set Price Alert</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <div className="text-sky-600 font-semibold">$19.57</div>
                          <div className="flex items-center mt-1">
                            <div className="text-xs text-gray-500">Target: $20.00</div>
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs h-5 bg-green-50 text-green-700 border-green-200"
                            >
                              -2.2%
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-teal-500 hover:bg-teal-600 h-8"
                          onClick={() => navigateTo("product-details")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-xs text-green-700">In Stock</span>
                        </div>
                        <span className="text-xs text-gray-500">Amazon</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t bg-white mt-auto">
        <div className="flex items-center justify-around p-2">
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => navigateTo("home")}>
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-teal-500">
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

"use client"

import {
  Bell,
  Check,
  ChevronRight,
  Clock,
  Heart,
  Home,
  Trash2,
  User,
  Zap,
  ShoppingBag,
  Tag,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NotificationsPageProps {
  navigateTo: (page: string) => void
}

export default function NotificationsPage({ navigateTo }: NotificationsPageProps) {
  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-400 to-sky-400 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-white/90 mt-1">Stay updated with your products</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 text-white hover:bg-white/30">
              <Check className="h-4 w-4" />
              <span className="sr-only">Mark all as read</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 text-white hover:bg-white/30">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear all</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-3 mt-2">
              <TabsTrigger value="all">All (5)</TabsTrigger>
              <TabsTrigger value="unread">Unread (3)</TabsTrigger>
              <TabsTrigger value="price">Price Alerts</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0 p-0">
            <ScrollArea className="h-[calc(600px-140px)]">
              <div className="divide-y">
                {/* Price Drop Notification */}
                <div
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigateTo("product-details")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-teal-100 text-teal-600">
                        <Tag className="h-5 w-5" />
                        <AvatarFallback>$</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">Price Drop Alert</h3>
                          <p className="text-xs text-gray-500 mt-0.5">1 hour ago</p>
                        </div>
                        <Badge className="bg-teal-500">New</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Aroma Housewares Rice Cooker is now <span className="font-medium text-teal-600">$19.57</span>,
                        below your target of $20.00
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border">
                        <div className="relative w-12 h-12">
                          <Image src="/placeholder.svg" alt="Rice Cooker" fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">Aroma Housewares 6-cup Rice Cooker</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-sky-600">$19.57</span>
                            <Badge
                              variant="outline"
                              className="text-xs h-4 bg-green-50 text-green-700 border-green-200"
                            >
                              -2.2%
                            </Badge>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 bg-teal-500 hover:bg-teal-600 text-xs">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Buy Now
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Alert Notification */}
                <div
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigateTo("product-details")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-green-100 text-green-600">
                        <Check className="h-5 w-5" />
                        <AvatarFallback>✓</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">Back in Stock</h3>
                          <p className="text-xs text-gray-500 mt-0.5">3 hours ago</p>
                        </div>
                        <Badge className="bg-teal-500">New</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Sony WH-1000XM4 Wireless Headphones are now back in stock at Best Buy
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border">
                        <div className="relative w-12 h-12">
                          <Image src="/placeholder.svg" alt="Headphones" fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">Sony WH-1000XM4 Wireless Headphones</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-sky-600">$248.00</span>
                            <div className="flex items-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                              <span className="text-xs text-green-700">In Stock</span>
                            </div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 bg-teal-500 hover:bg-teal-600 text-xs">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Buy Now
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Similar Product Notification */}
                <div
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigateTo("home")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-sky-100 text-sky-600">
                        <Zap className="h-5 w-5" />
                        <AvatarFallback>!</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">Similar Product Found</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Yesterday</p>
                        </div>
                        <Badge className="bg-gray-200 text-gray-700">Read</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        We found a similar coffee maker that might interest you based on your wishlist
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border">
                        <div className="relative w-12 h-12">
                          <Image src="/placeholder.svg" alt="Coffee Maker" fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">Breville Precision Brewer Coffee Maker</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-sky-600">$299.95</span>
                            <Badge
                              variant="outline"
                              className="text-xs h-4 bg-amber-50 text-amber-700 border-amber-200"
                            >
                              Premium
                            </Badge>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 bg-teal-500 hover:bg-teal-600 text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          Add to Wishlist
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Compare
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Increase Warning */}
                <div
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigateTo("product-details")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-amber-100 text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                        <AvatarFallback>!</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">Price Increase Warning</h3>
                          <p className="text-xs text-gray-500 mt-0.5">2 days ago</p>
                        </div>
                        <Badge className="bg-gray-200 text-gray-700">Read</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Keurig K-Elite Coffee Maker price has increased by 8.3% since you added it to your wishlist
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border">
                        <div className="relative w-12 h-12">
                          <Image src="/placeholder.svg" alt="Coffee Maker" fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">Keurig K-Elite Coffee Maker</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-sky-600">$129.99</span>
                            <Badge variant="outline" className="text-xs h-4 bg-red-50 text-red-700 border-red-200">
                              +8.3%
                            </Badge>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 bg-teal-500 hover:bg-teal-600 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Update Price Alert
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Notification */}
                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-gray-100 text-gray-600">
                        <Bell className="h-5 w-5" />
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">System Update</h3>
                          <p className="text-xs text-gray-500 mt-0.5">1 week ago</p>
                        </div>
                        <Badge className="bg-gray-200 text-gray-700">Read</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        ShopBot has been updated to version 2.4.0 with improved price tracking and comparison features
                      </p>

                      <div className="mt-3">
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          View Release Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="mt-0 p-0">
            <ScrollArea className="h-[calc(600px-140px)]">
              <div className="divide-y">
                {/* Price Drop Notification */}
                <div
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigateTo("product-details")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-teal-100 text-teal-600">
                        <Tag className="h-5 w-5" />
                        <AvatarFallback>$</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">Price Drop Alert</h3>
                          <p className="text-xs text-gray-500 mt-0.5">1 hour ago</p>
                        </div>
                        <Badge className="bg-teal-500">New</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Aroma Housewares Rice Cooker is now <span className="font-medium text-teal-600">$19.57</span>,
                        below your target of $20.00
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border">
                        <div className="relative w-12 h-12">
                          <Image src="/placeholder.svg" alt="Rice Cooker" fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">Aroma Housewares 6-cup Rice Cooker</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-sky-600">$19.57</span>
                            <Badge
                              variant="outline"
                              className="text-xs h-4 bg-green-50 text-green-700 border-green-200"
                            >
                              -2.2%
                            </Badge>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 bg-teal-500 hover:bg-teal-600 text-xs">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Buy Now
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Alert Notification */}
                <div
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigateTo("product-details")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-green-100 text-green-600">
                        <Check className="h-5 w-5" />
                        <AvatarFallback>✓</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">Back in Stock</h3>
                          <p className="text-xs text-gray-500 mt-0.5">3 hours ago</p>
                        </div>
                        <Badge className="bg-teal-500">New</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Sony WH-1000XM4 Wireless Headphones are now back in stock at Best Buy
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border">
                        <div className="relative w-12 h-12">
                          <Image src="/placeholder.svg" alt="Headphones" fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">Sony WH-1000XM4 Wireless Headphones</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-sky-600">$248.00</span>
                            <div className="flex items-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                              <span className="text-xs text-green-700">In Stock</span>
                            </div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 bg-teal-500 hover:bg-teal-600 text-xs">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Buy Now
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="price" className="mt-0 p-0">
            <ScrollArea className="h-[calc(600px-140px)]">
              <div className="divide-y">
                {/* Price Drop Notification */}
                <div
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigateTo("product-details")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-teal-100 text-teal-600">
                        <Tag className="h-5 w-5" />
                        <AvatarFallback>$</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">Price Drop Alert</h3>
                          <p className="text-xs text-gray-500 mt-0.5">1 hour ago</p>
                        </div>
                        <Badge className="bg-teal-500">New</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Aroma Housewares Rice Cooker is now <span className="font-medium text-teal-600">$19.57</span>,
                        below your target of $20.00
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border">
                        <div className="relative w-12 h-12">
                          <Image src="/placeholder.svg" alt="Rice Cooker" fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">Aroma Housewares 6-cup Rice Cooker</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-sky-600">$19.57</span>
                            <Badge
                              variant="outline"
                              className="text-xs h-4 bg-green-50 text-green-700 border-green-200"
                            >
                              -2.2%
                            </Badge>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 bg-teal-500 hover:bg-teal-600 text-xs">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Buy Now
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Increase Warning */}
                <div
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigateTo("product-details")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 bg-amber-100 text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                        <AvatarFallback>!</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900">Price Increase Warning</h3>
                          <p className="text-xs text-gray-500 mt-0.5">2 days ago</p>
                        </div>
                        <Badge className="bg-gray-200 text-gray-700">Read</Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Keurig K-Elite Coffee Maker price has increased by 8.3% since you added it to your wishlist
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border">
                        <div className="relative w-12 h-12">
                          <Image src="/placeholder.svg" alt="Coffee Maker" fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">Keurig K-Elite Coffee Maker</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-sky-600">$129.99</span>
                            <Badge variant="outline" className="text-xs h-4 bg-red-50 text-red-700 border-red-200">
                              +8.3%
                            </Badge>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 bg-teal-500 hover:bg-teal-600 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Update Price Alert
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => navigateTo("wishlist")}>
            <Heart className="h-5 w-5" />
            <span className="sr-only">Favorites</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-teal-500">
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

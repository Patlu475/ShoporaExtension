"use client"

import {
  Bell,
  CreditCard,
  ExternalLink,
  Eye,
  Facebook,
  Github,
  Globe,
  Heart,
  Home,
  Instagram,
  Lock,
  LogOut,
  Mail,
  Moon,
  Settings,
  Shield,
  Sun,
  Twitter,
  User,
  UserCheck,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

interface ProfilePageProps {
  navigateTo: (page: string) => void
}

export default function ProfilePage({ navigateTo }: ProfilePageProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white">
      {/* Header with gradient background and profile info */}
      <header className="relative">
        {/* Gradient background with pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-sky-500 h-32 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <path d="M 0 0 L 10 0" stroke="white" strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Settings button */}
        <div className="relative pt-4 px-4 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={() => {}}
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>

        {/* Profile card that overlaps the gradient */}
        <div className="relative px-4 pb-4 -mb-12">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Profile" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-sky-400 text-white text-lg">
                      RP
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">Rajpal Nikhil</h2>
                    <Badge className="bg-gradient-to-r from-teal-400 to-sky-400">Premium</Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">rajpalnikhil802@gmail.com</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-teal-200 text-teal-700 bg-teal-50">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-sky-200 text-sky-700 bg-sky-50">
                      <Zap className="h-3 w-3 mr-1" />
                      Power User
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-gray-600 hover:text-gray-900">
                    <Mail className="h-3.5 w-3.5" />
                    Message
                  </Button>
                  <Separator orientation="vertical" className="h-4" />
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-gray-600 hover:text-gray-900">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Share
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-gray-600 hover:text-gray-900 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="flex-1 pt-12 pb-14">
        <Tabs defaultValue="account" className="w-full">
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(600px-180px)]">
            {/* Account Tab */}
            <TabsContent value="account" className="mt-4 px-4 space-y-4">
              {/* Subscription Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-teal-500" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Premium Plan</p>
                      <p className="text-xs text-gray-500">Renews on May 12, 2023</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      Manage
                    </Button>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Usage</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Connected Accounts */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-teal-500" />
                    Connected Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white mr-3">
                        <Twitter className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Twitter</p>
                        <p className="text-xs text-gray-500">@rajpalnikhil</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-xs">
                      Disconnect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#24292e] flex items-center justify-center text-white mr-3">
                        <Github className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">GitHub</p>
                        <p className="text-xs text-gray-500">rajpalnikhil</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-xs">
                      Disconnect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white mr-3">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Instagram</p>
                        <p className="text-xs text-gray-500">Not connected</p>
                      </div>
                    </div>
                    <Button size="sm" className="h-8 text-xs bg-teal-500 hover:bg-teal-600">
                      Connect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white mr-3">
                        <Facebook className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Facebook</p>
                        <p className="text-xs text-gray-500">Not connected</p>
                      </div>
                    </div>
                    <Button size="sm" className="h-8 text-xs bg-teal-500 hover:bg-teal-600">
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-teal-500" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Password</p>
                        <p className="text-xs text-gray-500">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
                        <Eye className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Enhance your account security</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-4 px-4 space-y-4">
              {/* Theme Preferences */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Sun className="h-4 w-4 mr-2 text-teal-500" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
                        {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Dark Mode</p>
                        <p className="text-xs text-gray-500">
                          {isDarkMode ? "Currently using dark theme" : "Currently using light theme"}
                        </p>
                      </div>
                    </div>
                    <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-teal-500" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Price Alerts</p>
                      <p className="text-xs text-gray-500">Get notified when prices drop</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Stock Alerts</p>
                      <p className="text-xs text-gray-500">Get notified when items are back in stock</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Similar Products</p>
                      <p className="text-xs text-gray-500">Get notified about similar products</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Marketing Emails</p>
                      <p className="text-xs text-gray-500">Receive promotional emails</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Scanning Engine */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-teal-500" />
                    Scanning Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                      <span className="text-sm font-medium">Crawl4AI</span>
                      <Badge variant="outline" className="ml-auto bg-teal-50 text-teal-700 border-teal-200">
                        Active
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-500">
                      Crawl4AI is our most advanced scanning engine with AI-powered price comparison and product
                      matching.
                    </p>

                    <div className="pt-2">
                      <Button size="sm" variant="outline" className="w-full h-8 text-xs">
                        Change Engine
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-4 px-4 space-y-4">
              {/* Stats Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-teal-500">12</p>
                      <p className="text-xs text-gray-500 mt-1">Products Tracked</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-sky-500">5</p>
                      <p className="text-xs text-gray-500 mt-1">Price Alerts</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-500">$124</p>
                      <p className="text-xs text-gray-500 mt-1">Saved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        Added <span className="font-medium">Sony WH-1000XM4</span> to wishlist
                      </p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        Set price alert for <span className="font-medium">Aroma Rice Cooker</span>
                      </p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        Compared <span className="font-medium">3 coffee makers</span>
                      </p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        Upgraded to <span className="font-medium">Premium Plan</span>
                      </p>
                      <p className="text-xs text-gray-500">2 weeks ago</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
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
          <Button variant="ghost" size="icon" className="text-teal-500">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

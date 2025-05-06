"use client"

import type React from "react"
import { Search, Zap } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import BottomNavigation from "../navigation/BottomNavigation"

interface HomePageProps {
  navigateTo: (page: string) => void
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-400 to-sky-400 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-white" />
          <h1 className="text-xl font-bold text-white">ShopBot</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <span className="sr-only">Menu</span>
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
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuItem>Debug Mode</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome to ShopBot</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Compare prices, find deals, and discover similar products across the web.
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-teal-50 to-sky-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Quick Actions</h3>
                <Badge variant="outline" className="bg-white">
                  New
                </Badge>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white font-medium"
                onClick={() => navigateTo("product-details")}
              >
                <Search className="mr-2 h-4 w-4" />
                Scan Products
              </Button>

              <Tabs defaultValue="agentql" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="agentql">AgentQL</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>
                <TabsContent value="agentql" className="mt-2">
                  <div className="bg-white p-3 rounded-md border text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Using AgentQL</span>
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Intelligent shopping assistant powered by AI</p>
                  </div>
                </TabsContent>
                <TabsContent value="manual" className="mt-2">
                  <div className="bg-white p-3 rounded-md border text-sm">
                    <span className="font-medium">Manual Mode</span>
                    <p className="text-gray-500 text-xs mt-1">Control your shopping experience manually</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
            <div className="text-sm text-gray-500 flex items-center justify-center py-6">
              <p>No recent activity to show</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation currentPage="home" navigateTo={navigateTo} />
    </div>
  )
}

export default HomePage

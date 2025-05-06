"use client"

import type React from "react"
import { Home, Heart, Bell, User } from "lucide-react"
import { Button } from "../ui/button"

interface BottomNavigationProps {
  currentPage: string
  navigateTo: (page: string) => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, navigateTo }) => {
  return (
    <div className="border-t bg-white fixed bottom-0 w-[400px]">
      <div className="flex items-center justify-around p-2">
        <Button
          variant="ghost"
          size="icon"
          className={currentPage === "home" ? "text-teal-500" : "text-gray-500"}
          onClick={() => navigateTo("home")}
        >
          <Home className="h-5 w-5" />
          <span className="sr-only">Home</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={currentPage === "wishlist" ? "text-teal-500" : "text-gray-500"}
          onClick={() => navigateTo("wishlist")}
        >
          <Heart className="h-5 w-5" />
          <span className="sr-only">Favorites</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={currentPage === "notifications" ? "text-teal-500" : "text-gray-500"}
          onClick={() => navigateTo("notifications")}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={currentPage === "profile" ? "text-teal-500" : "text-gray-500"}
          onClick={() => navigateTo("profile")}
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Button>
      </div>
    </div>
  )
}

export default BottomNavigation

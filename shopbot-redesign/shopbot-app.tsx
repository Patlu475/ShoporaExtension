"use client"

import { useState } from "react"
import ShopBotHomepage from "./shopbot-homepage"
import WishlistPage from "./wishlist-page"
import NotificationsPage from "./notifications-page"
import ProfilePage from "./profile-page"
import ProductDetailsPage from "./product-details-page"

// Define the available pages
type Page = "home" | "wishlist" | "notifications" | "profile" | "product-details"

export default function ShopBotApp() {
  // State to track the current page
  const [currentPage, setCurrentPage] = useState<Page>("home")

  // Function to navigate between pages
  const navigateTo = (page: Page) => {
    setCurrentPage(page)
  }

  // Render the appropriate page based on the current state
  return (
    <div className="relative">
      {currentPage === "home" && <ShopBotHomepage navigateTo={navigateTo} />}
      {currentPage === "wishlist" && <WishlistPage navigateTo={navigateTo} />}
      {currentPage === "notifications" && <NotificationsPage navigateTo={navigateTo} />}
      {currentPage === "profile" && <ProfilePage navigateTo={navigateTo} />}
      {currentPage === "product-details" && <ProductDetailsPage navigateTo={navigateTo} />}
    </div>
  )
}

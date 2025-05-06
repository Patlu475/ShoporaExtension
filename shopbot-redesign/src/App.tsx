"use client"

import { useState } from "react"
import HomePage from "./components/pages/HomePage"
import WishlistPage from "./components/pages/WishlistPage"
import NotificationsPage from "./components/pages/NotificationsPage"
import ProfilePage from "./components/pages/ProfilePage"
import ProductDetailsPage from "./components/pages/ProductDetailsPage"

// Define the available pages
type Page = "home" | "wishlist" | "notifications" | "profile" | "product-details"

function App() {
  // State to track the current page
  const [currentPage, setCurrentPage] = useState<Page>("home")

  // Function to navigate between pages
  const navigateTo = (page: Page) => {
    setCurrentPage(page)
  }

  // Render the appropriate page based on the current state
  return (
    <div className="relative">
      {currentPage === "home" && <HomePage navigateTo={navigateTo} />}
      {currentPage === "wishlist" && <WishlistPage navigateTo={navigateTo} />}
      {currentPage === "notifications" && <NotificationsPage navigateTo={navigateTo} />}
      {currentPage === "profile" && <ProfilePage navigateTo={navigateTo} />}
      {currentPage === "product-details" && <ProductDetailsPage navigateTo={navigateTo} />}
    </div>
  )
}

export default App

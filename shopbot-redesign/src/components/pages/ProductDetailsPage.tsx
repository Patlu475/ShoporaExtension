"use client"

import type React from "react"
import { useState } from "react"
import ProductGallery from "../product/ProductGallery"
import ProductInfo from "../product/ProductInfo"
import ProductRetailers from "../product/ProductRetailers"
import ProductActions from "../product/ProductActions"
import ProductTabs from "../product/ProductTabs"
import SimilarProductsSection from "../product/SimilarProductsSection"
import BottomNavigation from "../navigation/BottomNavigation"
import Header from "../common/Header"
import { Separator } from "../ui/separator"

interface ProductDetailsPageProps {
  navigateTo: (page: string) => void
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ navigateTo }) => {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const productImages = [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ]

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white">
      <Header
        title="Product Details"
        showBackButton={true}
        onBackClick={() => navigateTo("home")}
        showShareButton={true}
      />

      <main className="flex-1 overflow-auto">
        <div className="pb-16">
          <ProductGallery
            images={productImages}
            isWishlisted={isWishlisted}
            onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
          />

          <div className="p-4">
            <ProductInfo
              name="Aroma Professional Rice Cooker"
              brand="Aroma Housewares"
              rating={4}
              reviewCount={245}
              price={19.57}
              originalPrice={24.99}
              discount={22}
              isBestPrice={true}
              inStock={true}
            />

            <ProductRetailers />

            <ProductActions
              onBuyNowClick={() => console.log("Buy now clicked")}
              onAddToWishlistClick={() => navigateTo("wishlist")}
              onSetPriceAlertClick={() => navigateTo("wishlist")}
            />
          </div>

          <Separator className="my-2" />

          <ProductTabs navigateTo={navigateTo} />

          <Separator className="my-4" />

          <SimilarProductsSection navigateTo={navigateTo} />
        </div>
      </main>

      <BottomNavigation currentPage="product-details" navigateTo={navigateTo} />
    </div>
  )
}

export default ProductDetailsPage

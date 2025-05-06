"use client"

import type React from "react"
import { ShoppingBag, Heart, Clock } from "lucide-react"
import { Button } from "../ui/button"

interface ProductActionsProps {
  onBuyNowClick: () => void
  onAddToWishlistClick: () => void
  onSetPriceAlertClick: () => void
}

const ProductActions: React.FC<ProductActionsProps> = ({
  onBuyNowClick,
  onAddToWishlistClick,
  onSetPriceAlertClick,
}) => {
  return (
    <>
      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600"
          onClick={onBuyNowClick}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Buy Now
        </Button>
        <Button variant="outline" className="flex-1" onClick={onAddToWishlistClick}>
          Add to Wishlist
          <Heart className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <Button
        variant="secondary"
        className="mt-2 w-full flex items-center justify-center"
        onClick={onSetPriceAlertClick}
      >
        <Clock className="h-4 w-4 mr-2" />
        Set Price Alert
      </Button>
    </>
  )
}

export default ProductActions

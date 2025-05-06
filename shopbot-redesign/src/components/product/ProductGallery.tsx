"use client"

import type React from "react"
import { useState } from "react"
import { Heart } from "lucide-react"

interface ProductGalleryProps {
  images: string[]
  isWishlisted: boolean
  onWishlistToggle: () => void
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, isWishlisted, onWishlistToggle }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  return (
    <div className="relative bg-gray-50 p-4">
      <div className="relative h-48 mx-auto w-full flex items-center justify-center">
        <img src={images[activeImageIndex] || "/placeholder.svg"} alt="Product" className="object-contain h-full" />

        <button
          className={`absolute top-0 right-2 p-2 rounded-full ${
            isWishlisted ? "bg-pink-100 text-pink-500" : "bg-white/80 text-gray-500 hover:bg-white"
          } shadow-sm`}
          onClick={onWishlistToggle}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-pink-500 text-pink-500" : ""}`} />
        </button>
      </div>

      {/* Image Thumbnails */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`w-12 h-12 rounded-md overflow-hidden border-2 ${
              activeImageIndex === idx ? "border-teal-500" : "border-transparent"
            }`}
            onClick={() => setActiveImageIndex(idx)}
          >
            <img src={img || "/placeholder.svg"} alt={`Thumbnail ${idx + 1}`} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductGallery

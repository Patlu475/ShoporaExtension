import type React from "react"
import { Star } from "lucide-react"
import { Badge } from "../ui/badge"

interface ProductInfoProps {
  name: string
  brand: string
  rating: number
  reviewCount: number
  price: number
  originalPrice?: number
  discount?: number
  isBestPrice?: boolean
  inStock?: boolean
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  brand,
  rating,
  reviewCount,
  price,
  originalPrice,
  discount,
  isBestPrice,
  inStock,
}) => {
  return (
    <>
      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        ))}
        <span className="text-xs text-gray-500 ml-1">({reviewCount} reviews)</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900">{name}</h2>
      <div className="flex items-center mt-1">
        <span className="text-sm text-gray-500">by</span>
        <span className="text-sm font-medium ml-1">{brand}</span>
        <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
          Verified Brand
        </Badge>
      </div>

      {/* Price and Stock */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-sky-600">${price.toFixed(2)}</div>
          {originalPrice && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
              {discount && <Badge className="ml-2 bg-green-500">-{discount}% OFF</Badge>}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          {isBestPrice && (
            <Badge variant="outline" className="text-sm mb-1 bg-teal-50 text-teal-700 border-teal-200">
              Best Price
            </Badge>
          )}
          {inStock && (
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs text-green-700">In Stock</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ProductInfo

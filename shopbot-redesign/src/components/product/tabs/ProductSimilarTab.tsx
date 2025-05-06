"use client"

import type React from "react"
import { Star, Heart } from "lucide-react"
import { Card, CardContent } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"

interface ProductSimilarTabProps {
  navigateTo: (page: string) => void
}

const ProductSimilarTab: React.FC<ProductSimilarTabProps> = ({ navigateTo }) => {
  const similarProducts = [
    {
      id: 1,
      name: "Zojirushi NS-LGC05 Rice Cooker",
      rating: 5,
      price: 139.99,
      image: "/placeholder.svg",
      badge: { text: "Sale", color: "bg-amber-500" },
    },
    {
      id: 2,
      name: "Instant Pot Zest 8 Cup Rice Cooker",
      rating: 4,
      price: 29.99,
      image: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Hamilton Beach Rice Cooker",
      rating: 4,
      price: 24.99,
      image: "/placeholder.svg",
      badge: { text: "Best Seller", color: "bg-teal-500" },
    },
    {
      id: 4,
      name: "Dash Mini Rice Cooker",
      rating: 3,
      price: 19.99,
      image: "/placeholder.svg",
    },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {similarProducts.map((product) => (
          <Card
            key={product.id}
            className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigateTo("product-details")}
          >
            <CardContent className="p-0">
              <div className="h-28 bg-gray-50 relative flex items-center justify-center">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="object-contain w-20 h-20"
                />
                {product.badge && (
                  <Badge className={`absolute top-2 right-2 ${product.badge.color} text-xs`}>
                    {product.badge.text}
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < product.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm font-semibold text-sky-600">${product.price.toFixed(2)}</div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                    <Heart className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" className="text-sm">
          View All Similar Products
        </Button>
      </div>
    </>
  )
}

export default ProductSimilarTab

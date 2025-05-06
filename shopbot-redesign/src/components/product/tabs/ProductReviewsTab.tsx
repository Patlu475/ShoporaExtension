import type React from "react"
import { Star, MessageSquare } from "lucide-react"
import { Button } from "../../ui/button"

const ProductReviewsTab: React.FC = () => {
  const reviews = [
    {
      name: "Sarah T.",
      rating: 5,
      date: "2 months ago",
      verified: true,
      comment:
        "Perfect rice every time! This cooker is so easy to use and clean. The automatic keep-warm function is really convenient.",
    },
    {
      name: "Mike R.",
      rating: 4,
      date: "1 month ago",
      verified: true,
      comment:
        "Good value for the price. The rice comes out well, though the measuring cup is a bit small. Would buy again.",
    },
  ]

  const ratingDistribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ]

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">4.2</div>
          <div className="flex gap-1 justify-center">
            {[...Array(4)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
            <Star className="h-3 w-3 text-gray-300" />
          </div>
          <div className="text-xs text-gray-500 mt-1">245 reviews</div>
        </div>

        <div className="flex-1">
          <div className="space-y-1">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <div className="text-xs w-6">{item.stars}★</div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.stars >= 4
                        ? "bg-green-500"
                        : item.stars === 3
                          ? "bg-amber-500"
                          : item.stars === 2
                            ? "bg-orange-500"
                            : "bg-red-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample reviews */}
      <div className="space-y-3">
        {reviews.map((review, index) => (
          <div key={index} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{review.name}</h4>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {review.verified ? "Verified Purchase • " : ""}
              {review.date}
            </p>
            <p className="text-sm mt-2">{review.comment}</p>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full text-sm">
        <MessageSquare className="h-4 w-4 mr-2" />
        Read All Reviews
      </Button>
    </>
  )
}

export default ProductReviewsTab

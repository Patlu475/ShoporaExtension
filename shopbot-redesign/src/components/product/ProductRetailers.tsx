import type React from "react"
import { Card, CardContent } from "../ui/card"

const ProductRetailers: React.FC = () => {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="text-sm font-medium">Available from 3 retailers</div>
      <div className="flex gap-2">
        <Card className="flex-1 cursor-pointer hover:bg-gray-50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <img src="/placeholder.svg" alt="Amazon" className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Amazon</span>
            </div>
            <div className="text-sm text-sky-600 font-semibold">$19.57</div>
          </CardContent>
        </Card>
        <Card className="flex-1 cursor-pointer hover:bg-gray-50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <img src="/placeholder.svg" alt="Walmart" className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Walmart</span>
            </div>
            <div className="text-sm text-gray-700 font-semibold">$22.99</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProductRetailers

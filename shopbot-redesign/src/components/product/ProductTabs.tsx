import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import ProductDetailsTab from "./tabs/ProductDetailsTab"
import ProductSpecsTab from "./tabs/ProductSpecsTab"
import ProductReviewsTab from "./tabs/ProductReviewsTab"
import ProductSimilarTab from "./tabs/ProductSimilarTab"

interface ProductTabsProps {
  navigateTo: (page: string) => void
}

const ProductTabs: React.FC<ProductTabsProps> = ({ navigateTo }) => {
  return (
    <div className="px-4">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="similar">Similar</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <ProductDetailsTab />
        </TabsContent>

        <TabsContent value="specs" className="mt-4 space-y-4">
          <ProductSpecsTab />
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-4">
          <ProductReviewsTab />
        </TabsContent>

        <TabsContent value="similar" className="mt-4 space-y-4">
          <ProductSimilarTab navigateTo={navigateTo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProductTabs

import type React from "react"

const ProductSpecsTab: React.FC = () => {
  const specs = [
    { name: "Model", value: "ARC-6106" },
    { name: "Capacity", value: "6 cups (cooked)" },
    { name: "Power", value: "120V, 60Hz" },
    { name: "Wattage", value: "300W" },
    { name: "Dimensions", value: '8.5" x 9" x 8.7"' },
    { name: "Weight", value: "2.45 lbs" },
    { name: "Warranty", value: "1 Year Limited" },
  ]

  return (
    <div className="space-y-2">
      {specs.map((spec, index) => (
        <div key={index} className="flex justify-between py-2 border-b">
          <span className="text-sm text-gray-600">{spec.name}</span>
          <span className="text-sm font-medium">{spec.value}</span>
        </div>
      ))}
    </div>
  )
}

export default ProductSpecsTab

import ProductScanner from "@/components/product-scanner"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center my-8 text-gray-800">Product Scanner Demo</h1>
        <p className="text-center text-gray-600 mb-8">
          Browse any e-commerce website and use the floating button to scan products and compare prices
        </p>

        {/* Simulated browser content */}
        <div className="border rounded-lg shadow-lg bg-white p-6 mb-20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="flex-1 bg-gray-100 rounded-md p-2 text-sm text-gray-600">
              https://example-store.com/products/wireless-headphones
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src="/placeholder.svg?height=400&width=400"
                alt="Wireless Headphones"
                className="rounded-lg w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Premium Wireless Headphones</h2>
              <div className="text-xl font-semibold text-gray-900 mb-4">$199.99</div>
              <p className="text-gray-600 mb-6">
                Experience crystal-clear sound with our premium wireless headphones. Featuring active noise
                cancellation, 30-hour battery life, and comfortable over-ear design for all-day listening.
              </p>
              <div className="flex gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-black border-2 border-gray-300"></div>
                <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300"></div>
                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-gray-300"></div>
              </div>
              <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>

      {/* Our product scanner component */}
      <ProductScanner />
    </main>
  )
}

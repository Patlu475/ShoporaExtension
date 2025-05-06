import type React from "react"

const ProductDetailsTab: React.FC = () => {
  return (
    <>
      <div>
        <h3 className="text-sm font-semibold mb-2">Description</h3>
        <p className="text-sm text-gray-700">
          The Aroma Professional Rice Cooker makes restaurant-quality rice at the touch of a button. Features include
          programmable digital controls, automatic keep-warm, and a steam tray for vegetables and more.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Key Features</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span>6-cup cooked capacity</span>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span>One-touch operation</span>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span>Automatic keep-warm function</span>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span>Non-stick inner cooking pot</span>
          </li>
        </ul>
      </div>
    </>
  )
}

export default ProductDetailsTab

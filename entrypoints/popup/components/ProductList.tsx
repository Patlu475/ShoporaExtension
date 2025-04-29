import React, { memo, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../App';

interface ProductListProps {
  products: Product[];
  isVisible: boolean;
  isLoading: boolean;
}

// Limit the number of products rendered initially for better performance
const INITIAL_PRODUCT_COUNT = 3;

const ProductList: React.FC<ProductListProps> = memo(({ products, isVisible, isLoading }) => {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Update visible products when the products array changes
  useEffect(() => {
    console.log("ProductList received products:", products);
    
    try {
      if (products.length <= INITIAL_PRODUCT_COUNT) {
        setVisibleProducts(products);
        setShowAll(true);
      } else {
        setVisibleProducts(products.slice(0, INITIAL_PRODUCT_COUNT));
        setShowAll(false);
      }
      
      // For debugging only
      setDebugInfo(`Received ${products.length} products. First product: ${products.length > 0 ? products[0].title : 'none'}`);
    } catch (error) {
      console.error("Error processing products:", error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [products]);

  // Show more products when the user clicks the button
  const handleShowMore = () => {
    setVisibleProducts(products);
    setShowAll(true);
  };

  // If not visible, render nothing
  if (!isVisible) return null;
  
  // If loading, show skeleton cards
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-100 rounded-md h-72 w-full"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // If no products found
  if (!products || products.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-6 text-center rounded-xl border border-gray-100 shadow-sm">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-gray-700 font-medium mb-1">No Products Found</h3>
        <p className="text-gray-500 text-sm">
          We couldn't find any products on this page. Try scanning a different product page.
        </p>
      </div>
    );
  }
  
  // Render the product grid
  return (
    <div className="products-grid">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.map((product, index) => (
          <ProductCard 
            key={`product-${index}`} 
            product={product} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
});

ProductList.displayName = 'ProductList';

export default ProductList; 
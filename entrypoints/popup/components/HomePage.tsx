import React from 'react';
import { Scan, Search, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import ProductList from './ProductList';
import { Product } from '../App';
import { ExtractionStrategy } from '../../services/product-extractor';

interface HomePageProps {
  isLoading: boolean;
  isResultsVisible: boolean;
  products: Product[];
  extractionStrategy: ExtractionStrategy;
  onScan: () => void;
  onClearResults: () => void;
  onStrategyChange: (strategy: ExtractionStrategy) => void;
  onViewProductDetails: (product: Product) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  isLoading,
  isResultsVisible,
  products,
  extractionStrategy,
  onScan,
  onClearResults,
  onStrategyChange,
  onViewProductDetails
}) => {
  return (
    <main className="w-[350px] h-[600px] transition-all duration-300 ease-in-out">
      <div className="h-full p-0">
        {!isResultsVisible ? (
          <div className="h-[550px] flex flex-col items-center justify-center pt-8 bg-gradient-to-b from-blue-50 to-white">
            <div className="text-center mb-4 px-4">
              <h1 className="text-xl font-bold text-blue-600 mb-1">Welcome to ShopBot</h1>
              <p className="text-gray-600 text-xs max-w-[280px] mx-auto">
                Compare prices, find deals, and discover similar products across the web.
              </p>
            </div>
            
            <div className="w-full px-3">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <Input 
                        placeholder="Search for products..."
                        className="flex-1 h-8 text-sm"
                        disabled
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => onStrategyChange(
                                extractionStrategy === ExtractionStrategy.AgentQL 
                                  ? ExtractionStrategy.LLM 
                                  : ExtractionStrategy.AgentQL
                              )}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {extractionStrategy === ExtractionStrategy.AgentQL ? 'AI Mode' : 'Basic Mode'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Switch between AI and basic extraction modes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Badge variant="secondary" className="text-xs">
                        {extractionStrategy === ExtractionStrategy.AgentQL ? 'AI Powered' : 'Basic'}
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm"
                      onClick={onScan}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Scan className="h-3 w-3 mr-1" />
                          Scan Current Page
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="pt-12 px-3 pb-3 overflow-y-auto h-[550px]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-gray-800">Product Results</h2>
              <button 
                onClick={onClearResults}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Clear Results
              </button>
            </div>
            
            <div className="space-y-3">
              {products.map((product, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onViewProductDetails(product)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          className="object-contain h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {product.title}
                        </h3>
                        <p className="text-sky-600 font-semibold text-sm mb-1">
                          {product.price}
                        </p>
                        {product.availability && (
                          <p className={`text-xs font-medium ${
                            product.availability.toLowerCase().includes('in stock') 
                              ? "text-green-600" 
                              : product.availability.toLowerCase().includes('out of stock')
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}>
                            {product.availability}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage; 
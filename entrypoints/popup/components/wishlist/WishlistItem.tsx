import React from 'react';
import { ChevronRight, Clock, MoreHorizontal, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Product {
  id: string;
  title: string;
  price: string | number;
  image: string;
  availability?: string;
  store?: string;
  priceChange?: number;
  targetPrice?: string | number;
  inStock?: boolean;
}

interface WishlistItemProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onRemove: (productId: string) => void;
  onSetPriceAlert: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({
  product,
  onViewDetails,
  onRemove,
  onSetPriceAlert,
  onBuyNow,
}) => {
  const priceChange = product.priceChange || 0;
  const isPriceDrop = priceChange < 0;
  const priceChangePercentage = Math.abs(priceChange).toFixed(1);

  // Format price with proper currency symbol
  const formatPrice = (price: string | number) => {
    if (typeof price === 'string') {
      // If price is already formatted, return as is
      if (price.includes('$') || price.includes('€') || price.includes('£')) {
        return price;
      }
      // Try to parse the price
      const numericPrice = parseFloat(price);
      if (!isNaN(numericPrice)) {
        return `$${numericPrice.toFixed(2)}`;
      }
      return price;
    }
    return `$${price.toFixed(2)}`;
  };

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (!product.availability) return { status: 'Unknown', color: 'gray' };
    
    const availability = product.availability.toLowerCase();
    if (availability.includes('in stock')) {
      return { status: 'In Stock', color: 'green' };
    } else if (availability.includes('out of stock')) {
      return { status: 'Out of Stock', color: 'red' };
    } else if (availability.includes('pre-order')) {
      return { status: 'Pre-order', color: 'blue' };
    } else if (availability.includes('backorder')) {
      return { status: 'Backorder', color: 'yellow' };
    }
    return { status: product.availability, color: 'gray' };
  };

  const availability = getAvailabilityStatus();

  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <div className="h-28 bg-gray-50 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.title}
              className="object-contain h-20 w-auto cursor-pointer"
              onClick={() => onViewDetails(product)}
            />
          </div>
          {isPriceDrop && (
            <Badge className="absolute top-2 right-2 bg-teal-500 hover:bg-teal-600">
              Best Price
            </Badge>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between">
            <h3
              className="font-medium text-sm line-clamp-2 cursor-pointer"
              onClick={() => onViewDetails(product)}
            >
              {product.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer" onClick={() => onBuyNow(product)}>
                  <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                  <span>Buy Now</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => onSetPriceAlert(product)}>
                  <Clock className="h-3.5 w-3.5 mr-2" />
                  <span>Set Price Alert</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-500" onClick={() => onRemove(product.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  <span>Remove</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2">
            <div className="text-sky-600 font-semibold">{formatPrice(product.price)}</div>
              {product.targetPrice && (
                <div className="flex items-center mt-1">
                <div className="text-xs text-gray-500">Target: {formatPrice(product.targetPrice)}</div>
                  <Badge
                    variant="outline"
                    className={`ml-2 text-xs h-5 ${
                      isPriceDrop
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {isPriceDrop ? '-' : '+'}{priceChangePercentage}%
                  </Badge>
                </div>
              )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full bg-${availability.color}-500 mr-2`}></div>
              <span className={`text-xs text-${availability.color}-700`}>
                {availability.status}
              </span>
            </div>
            {product.store && (
            <span className="text-xs text-gray-500">{product.store}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistItem; 
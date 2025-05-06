import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

interface WishlistTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  counts: {
    all: number;
    priceAlerts: number;
    inStock: number;
  };
}

const WishlistTabs: React.FC<WishlistTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <div className="border-b">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="px-3">
          <TabsList className="grid w-full grid-cols-3 mt-2">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="price-alerts">Price Alerts ({counts.priceAlerts})</TabsTrigger>
            <TabsTrigger value="in-stock">In Stock ({counts.inStock})</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default WishlistTabs; 
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface WishlistHeaderProps {
  onAddItem?: () => void;
}

const WishlistHeader: React.FC<WishlistHeaderProps> = ({ onAddItem }) => {
  return (
    <header className="bg-gradient-to-r from-teal-400 to-sky-400 p-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">My Wishlist</h1>
          <p className="text-xs text-white/90 mt-0.5">Track your favorite products</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/20 text-white hover:bg-white/30 h-7 w-7"
          onClick={onAddItem}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only">Add item</span>
        </Button>
      </div>
    </header>
  );
};

export default WishlistHeader; 
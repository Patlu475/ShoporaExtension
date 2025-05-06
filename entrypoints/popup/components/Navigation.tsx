import React from 'react';
import { Bell, Heart, Home, User } from 'lucide-react';
import { Button } from './ui/button';

type ActivePage = 'home' | 'wishlists' | 'notifications' | 'profile';

interface NavigationProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activePage, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white z-50">
      <div className="flex items-center justify-around p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className={activePage === 'home' ? 'text-teal-500' : 'text-gray-500'}
          onClick={() => onNavigate('home')}
        >
          <Home className="h-5 w-5" />
          <span className="sr-only">Home</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={activePage === 'wishlists' ? 'text-teal-500' : 'text-gray-500'}
          onClick={() => onNavigate('wishlists')}
        >
          <Heart className="h-5 w-5" />
          <span className="sr-only">Favorites</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={activePage === 'notifications' ? 'text-teal-500' : 'text-gray-500'}
          onClick={() => onNavigate('notifications')}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={activePage === 'profile' ? 'text-teal-500' : 'text-gray-500'}
          onClick={() => onNavigate('profile')}
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default Navigation; 
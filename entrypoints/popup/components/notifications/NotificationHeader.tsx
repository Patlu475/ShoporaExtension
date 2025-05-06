import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface NotificationHeaderProps {
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ onMarkAllRead, onClearAll }) => {
  return (
    <header className="bg-gradient-to-r from-teal-400 to-sky-400 p-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Notifications</h1>
          <p className="text-xs text-white/90 mt-0.5">Stay updated with your products</p>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/20 text-white hover:bg-white/30 h-7 w-7"
            onClick={onMarkAllRead}
          >
            <Check className="h-3.5 w-3.5" />
            <span className="sr-only">Mark all as read</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/20 text-white hover:bg-white/30 h-7 w-7"
            onClick={onClearAll}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Clear all</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default NotificationHeader; 
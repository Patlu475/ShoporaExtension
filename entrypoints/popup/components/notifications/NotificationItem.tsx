import React from 'react';
import { Bell, Tag, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NotificationItemProps {
  type: 'price' | 'stock' | 'alert';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  message,
  time,
  isRead,
  onClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'price':
        return <Tag className="h-4 w-4 text-blue-500" />;
      case 'stock':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer transition-colors",
        !isRead && "bg-sky-50",
        "hover:bg-gray-50"
      )}
      onClick={onClick}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{message}</p>
      </div>
    </div>
  );
};

export default NotificationItem; 
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import NotificationItem from './NotificationItem';

interface Notification {
  id: string;
  type: 'price' | 'stock' | 'alert';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
}) => {
  return (
    <ScrollArea className="flex-1">
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            time={notification.time}
            isRead={notification.isRead}
            onClick={() => onNotificationClick(notification.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationList; 
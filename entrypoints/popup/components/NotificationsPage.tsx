import React, { useState, useEffect } from 'react';
import GridBeam from './GridBeam';
import { Notification, notificationService } from '../../services/firebase/notifications';
import { formatDistanceToNow } from 'date-fns';
import { wishlistService } from '../../services/firebase/wishlist';
import { auth } from '../../services/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import NotificationHeader from './notifications/NotificationHeader';
import NotificationList from './notifications/NotificationList';

// Custom interface for UI notifications that includes all required fields
interface UINotification {
  id: string;
  type: 'discount' | 'availability';
  title: string;
  message: string;
  productImage: string;
  productName: string;
  productPrice: string;
  timestamp: string;
  isRead: boolean;
}

// Simple auth hook since we couldn't find the existing one
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to load notifications from Firebase
  const loadNotifications = async (forceRefresh = false) => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Pass skipCache=true when forcing a refresh (only when user clicks refresh button)
      const firestoreNotifications = await notificationService.getNotifications(user.uid, forceRefresh);
      
      // Transform Firebase notifications to UI notifications
      const uiNotifications = await Promise.all(firestoreNotifications.map(async (notification) => {
        // Get product details from wishlist if needed
        const productDetails = { title: '', image: '', price: '' };
        
        // Try to get product details if we have the product ID
        if (notification.productId && notification.productId !== 'system' && notification.productId !== 'test-product') {
          try {
            const wishlist = await wishlistService.getWishlist(user.uid);
            const product = wishlist.find(p => p.id === notification.productId);
            if (product) {
              productDetails.title = product.title;
              productDetails.image = product.image;
              productDetails.price = product.price;
            }
          } catch (error) {
            console.error('Error fetching product details:', error);
          }
        }
        
        // Convert Firebase notification to UI notification
        return {
          id: notification.id || '',
          type: notification.type === 'price_alert' ? 'discount' : 
                notification.type === 'availability_alert' ? 'availability' : 'discount',
          title: notification.type === 'price_alert' ? 'Price Drop Alert!' : 
                 notification.type === 'availability_alert' ? 'Back in Stock!' : 'Notification',
          message: notification.message,
          productImage: notification.productImage || productDetails.image,
          productName: notification.productName || productDetails.title,
          productPrice: notification.productPrice || productDetails.price,
          timestamp: formatTimestamp(notification.timestamp),
          isRead: notification.read
        } as UINotification;
      }));
      
      setNotifications(uiNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    // Initial load will use cache if available
    loadNotifications(false);
  }, [user]);

  // Helper to format timestamps
  const formatTimestamp = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state to reflect the change
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.uid);
      // Update local state to reflect all notifications as read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Update local state to remove the deleted notification
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: UINotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // Additional click behavior if needed
  };

  // Handle refresh wishlist
  const handleRefreshWishlist = async () => {
    if (!user || refreshing) return;
    
    try {
      setRefreshing(true);
      
      // First clear any existing notifications
      setNotifications([
        {
          id: 'refreshing',
          type: 'discount',
          title: 'Refreshing...',
          message: 'Checking your wishlist items for updates...',
          productImage: '',
          productName: '',
          productPrice: '',
          timestamp: 'just now',
          isRead: true
        }
      ]);
      
      // Call the refresh endpoint
      await wishlistService.refreshWishlist(user.uid);
      
      // Wait a moment to allow notifications to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force a refresh from the database
      await loadNotifications(true);
      
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
      
      // Show error message as a notification
      setNotifications([
        {
          id: 'error',
          type: 'discount',
          title: 'Refresh Failed',
          message: 'Could not check for updates. Please try again later.',
          productImage: '',
          productName: '',
          productPrice: '',
          timestamp: 'just now',
          isRead: true
        }
      ]);
      
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="h-[600px] w-[350px] bg-white flex flex-col">
      <NotificationHeader
        onMarkAllRead={markAllAsRead}
        onClearAll={() => {
          const confirmed = window.confirm('Delete all notifications?');
          if (confirmed && user) {
            notificationService.deleteAllNotifications(user.uid)
              .then(() => setNotifications([]))
              .catch(e => console.error('Error deleting all notifications:', e));
          }
        }}
      />
      <NotificationList
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
};

export default NotificationsPage; 
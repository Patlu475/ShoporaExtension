import React, { useState, useEffect } from 'react';
import GridBeam from './GridBeam';
import { Notification, notificationService } from '../../services/firebase/notifications';
import { formatDistanceToNow } from 'date-fns';
import { wishlistService } from '../../services/firebase/wishlist';
import { auth } from '../../services/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

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
    <div className="w-full h-full">
      <GridBeam className="h-full overflow-y-auto">
        {/* Gradient Header */}
        <div className="relative h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1">Notifications</h1>
              <p className="text-sm text-white/90">Stay updated with your products</p>
            </div>
          </div>
        </div>

        {/* Notification Controls */}
        <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button 
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                onClick={() => {
                  const confirmed = window.confirm('Delete all notifications?');
                  if (confirmed && user) {
                    notificationService.deleteAllNotifications(user.uid)
                      .then(() => setNotifications([]))
                      .catch(e => console.error('Error deleting all notifications:', e));
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
              <button 
                className={`p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 ${refreshing ? 'opacity-75 pointer-events-none' : ''}`}
                onClick={handleRefreshWishlist}
                title="Check for updated wishlist items"
                disabled={refreshing}
              >
                <svg 
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="px-4 py-4 space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                  !notification.isRead ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'discount' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {notification.type === 'discount' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      
                      {/* Product Preview */}
                      <div className="mt-3 flex items-center space-x-3">
                        {notification.productImage && (
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                            <img
                              src={notification.productImage}
                              alt={notification.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{notification.productName}</p>
                          <p className="text-sm text-gray-600">{notification.productPrice}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  You'll receive notifications here when your tracked products have price drops or become available.
                </p>
              </div>
            )}
          </div>
        )}
      </GridBeam>
    </div>
  );
};

export default NotificationsPage; 
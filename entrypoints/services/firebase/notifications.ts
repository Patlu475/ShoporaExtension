import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  orderBy,
  doc,
  Timestamp,
  deleteDoc,
  getDoc,
  writeBatch,
  Firestore
} from 'firebase/firestore';
import { db } from './config';
import browser from 'webextension-polyfill';

/**
 * Represents a notification in the system
 */
export interface Notification {
  id?: string;
  userId: string;
  productId: string;
  productName?: string;
  productImage?: string;
  productPrice?: string;
  type: 'price_alert' | 'availability_alert' | 'other';
  message: string;
  timestamp: number;
  read: boolean;
}

/**
 * Service for managing notifications
 */
export class NotificationService {
  private collectionName = 'notifications';
  private storageKey = 'cached_notifications';
  
  /**
   * Create a new notification
   * @param notification Notification data
   * @returns Promise with the created notification ID
   */
  async createNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      const notificationData = {
        ...notification,
        timestamp: notification.timestamp || Date.now(),
        read: false
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), notificationData);
      
      // Clear the notification cache to force a refresh on next load
      await this.clearCachedNotifications(notification.userId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Get all notifications for a user
   * @param userId User ID to get notifications for
   * @param skipCache Whether to skip the cache and fetch from the database
   * @returns Promise with an array of notifications
   */
  async getNotifications(userId: string, skipCache: boolean = false): Promise<Notification[]> {
    try {
      // Check cache first if not explicitly skipping
      if (!skipCache) {
        const cachedNotifications = await this.getCachedNotifications(userId);
        if (cachedNotifications.length > 0) {
          console.log('Using cached notifications:', cachedNotifications.length);
          return cachedNotifications;
        }
      }
      
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      // First check if the notifications collection exists, if not create an empty one
      try {
        // Simple query first to check if collection exists
        const simpleQuery = query(
          collection(db, this.collectionName),
          where("userId", "==", userId)
        );
        
        await getDocs(simpleQuery);
      } catch (err) {
        console.log("Creating notifications collection automatically");
        // If there's an error, the collection might not exist yet
        // Return an empty array since there are no notifications
        return [];
      }
      
      // Now try the full query with ordering
      try {
        const q = query(
          collection(db, this.collectionName),
          where("userId", "==", userId),
          orderBy("timestamp", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const notifications: Notification[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Notification;
          notifications.push({
            ...data,
            id: doc.id
          });
        });
        
        // Cache the notifications
        await this.cacheNotifications(userId, notifications);
        
        return notifications;
      } catch (indexError: any) {
        // Handle missing index error specifically
        if (indexError.message && indexError.message.includes('requires an index')) {
          console.error('Firebase index error: Please follow the link to create the required index.');
          console.error(indexError.message);
          
          // Create a simple notification to show the user how to fix it
          return [{
            id: 'index-error',
            userId: userId,
            productId: 'system',
            type: 'other',
            message: 'System notification: Please create the required Firebase index for notifications. See console for details.',
            timestamp: Date.now(),
            read: false
          }];
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }
  
  /**
   * Mark a notification as read
   * @param notificationId ID of the notification to mark as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      const firestore = db as Firestore;
      const notificationRef = doc(firestore, this.collectionName, notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
      
      // Update notification in cache if it exists
      await this.updateCachedNotification(notificationId, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications for a user as read
   * @param userId User ID to mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      const firestore = db as Firestore;
      try {
        const q = query(
          collection(firestore, this.collectionName),
          where("userId", "==", userId),
          where("read", "==", false)
        );
        
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(firestore);
        
        querySnapshot.forEach((document) => {
          const docRef = doc(firestore, this.collectionName, document.id);
          batch.update(docRef, { read: true });
        });
        
        await batch.commit();
        
        // Update all notifications in cache
        await this.markAllCachedAsRead(userId);
      } catch (indexError: any) {
        // Handle missing index error specifically
        if (indexError.message && indexError.message.includes('requires an index')) {
          console.error('Firebase index error: Please follow the link to create the required index.');
          console.error(indexError.message);
          // Don't throw, just log the error and continue
          return;
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Delete a notification
   * @param notificationId ID of the notification to delete
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      const firestore = db as Firestore;
      const docRef = doc(firestore, this.collectionName, notificationId);
      
      // Get the notification before deleting to find its userId
      const notificationSnapshot = await getDoc(docRef);
      if (notificationSnapshot.exists()) {
        const notification = notificationSnapshot.data() as Notification;
        
        // Delete the notification
        await deleteDoc(docRef);
        
        // Remove from cache
        await this.deleteCachedNotification(notification.userId, notificationId);
      } else {
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
  
  /**
   * Delete all notifications for a user
   * @param userId User ID to delete all notifications for
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      const firestore = db as Firestore;
      try {
        const q = query(
          collection(firestore, this.collectionName),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(firestore);
        
        querySnapshot.forEach((document) => {
          const docRef = doc(firestore, this.collectionName, document.id);
          batch.delete(docRef);
        });
        
        await batch.commit();
        
        // Clear cache
        await this.clearCachedNotifications(userId);
      } catch (indexError: any) {
        // Handle missing index error specifically
        if (indexError.message && indexError.message.includes('requires an index')) {
          console.error('Firebase index error: Please follow the link to create the required index.');
          console.error(indexError.message);
          // Don't throw, just log the error and continue
          return;
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
  
  /**
   * Check for and create notifications for price changes or availability changes
   * @param userId User ID to check for
   * @param productId Product ID to check
   * @param newPrice New price to compare against target
   * @param newAvailability New availability status
   * @param productName Name of the product
   * @param productImage Image of the product
   * @param previousPrice Previous price of the product
   */
  async checkAndCreateNotifications(
    userId: string,
    productId: string,
    newPrice: string,
    newAvailability: string,
    productName: string,
    productImage: string,
    previousPrice?: string
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      // Parse price values for comparison
      const newPriceNumber = parseFloat(newPrice.replace(/[^0-9.]/g, ''));
      const prevPriceNumber = previousPrice ? parseFloat(previousPrice.replace(/[^0-9.]/g, '')) : null;
      
      // Create appropriate notifications
      if (prevPriceNumber && newPriceNumber < prevPriceNumber) {
        // Price drop notification
        await this.createNotification({
          userId,
          productId,
          productName,
          productImage,
          productPrice: newPrice,
          type: 'price_alert',
          message: `Price dropped from ${previousPrice} to ${newPrice}!`,
          timestamp: Date.now(),
          read: false
        });
      }
      
      // Check if item is back in stock
      if (newAvailability.toLowerCase().includes('in stock') || 
          newAvailability.toLowerCase().includes('available')) {
        await this.createNotification({
          userId,
          productId,
          productName,
          productImage,
          productPrice: newPrice,
          type: 'availability_alert',
          message: `${productName} is now available!`,
          timestamp: Date.now(),
          read: false
        });
      }
    } catch (error) {
      console.error('Error checking and creating notifications:', error);
      throw error;
    }
  }
  
  /**
   * Create a test notification to ensure the collection exists
   * @param userId User ID to create test notification for
   */
  async createTestNotification(userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      // Check if the collection already has documents
      try {
        const simpleQuery = query(
          collection(db, this.collectionName),
          where("userId", "==", userId)
        );
        
        const existingDocs = await getDocs(simpleQuery);
        
        // If there are already notifications, don't create a test one
        if (!existingDocs.empty) {
          return;
        }
      } catch (err) {
        // If there's an error, proceed with creating a test notification
        console.log("No existing notifications found");
      }
      
      // Create a test notification
      await this.createNotification({
        userId,
        productId: "test-product",
        productName: "Test Product",
        productImage: "https://via.placeholder.com/150",
        productPrice: "$99.99",
        type: "other",
        message: "Notifications are now working! You'll receive updates here when product prices drop or items become available.",
        timestamp: Date.now(),
        read: false
      });
      
      console.log("Created test notification for user: " + userId);
    } catch (error) {
      console.error('Error creating test notification:', error);
      // Don't throw, just log the error
    }
  }

  /**
   * Cache notifications in local storage
   * @param userId User ID to cache notifications for
   * @param notifications Notifications to cache
   */
  private async cacheNotifications(userId: string, notifications: Notification[]): Promise<void> {
    try {
      // Store the notifications in local storage with user ID as part of the key
      const storageKey = `${this.storageKey}_${userId}`;
      await browser.storage.local.set({ 
        [storageKey]: {
          notifications,
          timestamp: Date.now()
        }
      });
      console.log(`Cached ${notifications.length} notifications for user ${userId}`);
    } catch (error) {
      console.error('Error caching notifications:', error);
    }
  }

  /**
   * Get cached notifications from local storage
   * @param userId User ID to get cached notifications for
   * @returns Promise with an array of notifications
   */
  private async getCachedNotifications(userId: string): Promise<Notification[]> {
    try {
      const storageKey = `${this.storageKey}_${userId}`;
      const result = await browser.storage.local.get(storageKey);
      
      if (result && storageKey in result) {
        const cacheData = result[storageKey] as { notifications: Notification[], timestamp: number };
        if (cacheData && Array.isArray(cacheData.notifications)) {
          const cacheAge = Date.now() - cacheData.timestamp;
          
          // Consider cache valid for 5 minutes (300000ms)
          // You can adjust this value as needed
          const CACHE_VALIDITY = 300000;
          
          if (cacheAge < CACHE_VALIDITY) {
            return cacheData.notifications;
          } else {
            console.log('Cache expired, fetching fresh data');
          }
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error getting cached notifications:', error);
      return [];
    }
  }

  /**
   * Clear cached notifications for a user
   * @param userId User ID to clear cached notifications for
   */
  private async clearCachedNotifications(userId: string): Promise<void> {
    try {
      const storageKey = `${this.storageKey}_${userId}`;
      await browser.storage.local.remove(storageKey);
      console.log(`Cleared cached notifications for user ${userId}`);
    } catch (error) {
      console.error('Error clearing cached notifications:', error);
    }
  }

  /**
   * Update a notification in the cache
   * @param notificationId ID of the notification to update
   * @param updates Updates to apply to the notification
   */
  private async updateCachedNotification(notificationId: string, updates: Partial<Notification>): Promise<void> {
    try {
      // First, we need to find which user's cache contains this notification
      const allStorageKeys = await browser.storage.local.get();
      
      for (const key of Object.keys(allStorageKeys)) {
        if (key.startsWith(this.storageKey)) {
          const cacheData = allStorageKeys[key] as { notifications: Notification[], timestamp: number };
          if (cacheData && Array.isArray(cacheData.notifications)) {
            const notifications = cacheData.notifications;
            
            // Find the notification in this cache
            const index = notifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
              // Update the notification
              notifications[index] = {
                ...notifications[index],
                ...updates
              };
              
              // Save the updated cache
              await browser.storage.local.set({ 
                [key]: {
                  notifications,
                  timestamp: cacheData.timestamp
                }
              });
              
              console.log(`Updated notification ${notificationId} in cache`);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating cached notification:', error);
    }
  }

  /**
   * Delete a notification from the cache
   * @param userId User ID to delete notification for
   * @param notificationId ID of the notification to delete
   */
  private async deleteCachedNotification(userId: string, notificationId: string): Promise<void> {
    try {
      const storageKey = `${this.storageKey}_${userId}`;
      const result = await browser.storage.local.get(storageKey);
      
      if (result && storageKey in result) {
        const cacheData = result[storageKey] as { notifications: Notification[], timestamp: number };
        if (cacheData && Array.isArray(cacheData.notifications)) {
          const notifications = cacheData.notifications;
          
          // Filter out the deleted notification
          const updatedNotifications = notifications.filter(n => n.id !== notificationId);
          
          // Save the updated cache
          await browser.storage.local.set({ 
            [storageKey]: {
              notifications: updatedNotifications,
              timestamp: cacheData.timestamp
            }
          });
          
          console.log(`Removed notification ${notificationId} from cache`);
        }
      }
    } catch (error) {
      console.error('Error deleting cached notification:', error);
    }
  }

  /**
   * Mark all cached notifications as read
   * @param userId User ID to mark all cached notifications as read
   */
  private async markAllCachedAsRead(userId: string): Promise<void> {
    try {
      const storageKey = `${this.storageKey}_${userId}`;
      const result = await browser.storage.local.get(storageKey);
      
      if (result && storageKey in result) {
        const cacheData = result[storageKey] as { notifications: Notification[], timestamp: number };
        if (cacheData && Array.isArray(cacheData.notifications)) {
          const notifications = cacheData.notifications;
          
          // Mark all notifications as read
          const updatedNotifications = notifications.map(n => ({
            ...n,
            read: true
          }));
          
          // Save the updated cache
          await browser.storage.local.set({ 
            [storageKey]: {
              notifications: updatedNotifications,
              timestamp: cacheData.timestamp
            }
          });
          
          console.log(`Marked all cached notifications as read for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error marking all cached notifications as read:', error);
    }
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService(); 
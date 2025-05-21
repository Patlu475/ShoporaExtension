import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc, 
  updateDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './config';
import { nanoid } from 'nanoid';

// Interface for the Product type
export interface Product {
  id?: string;
  title: string;
  description: string;
  price: string;
  image: string;
  website: string;
  availability?: string;
  category?: string;
  dateAdded?: number;
  url?: string;
  target?: string | null; // Add target field for alert preferences
  targetMet?: boolean; // Add field to track if target has been met
}

/**
 * Service to handle wishlist operations with Firestore
 */
export class WishlistService {
  private collectionName = 'wishlists';
  
  /**
   * Add a product to a user's wishlist
   * @param userId User's ID
   * @param product Product to add
   * @returns Promise with the product ID
   */
  async addToWishlist(userId: string, product: Product): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      // Check if the product already exists in the wishlist
      const existingProduct = await this.findProductInWishlist(userId, product);
      
      if (existingProduct) {
        // If product exists, update it
        await updateDoc(doc(db, this.collectionName, existingProduct.id as string), {
          ...product,
          dateModified: Date.now()
        });
        return existingProduct.id as string;
      }
      
      // If product doesn't exist, create a new one
      const productId = product.id || nanoid(10);
      const productWithId = {
        ...product,
        id: productId,
        dateAdded: Date.now(),
        targetMet: false // Initialize targetMet as false
      };
      
      // Create a document with a specific ID in the collection
      await setDoc(doc(db, this.collectionName, productId), {
        userId,
        product: productWithId
      });
      
      return productId;
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
      throw error;
    }
  }
  
  /**
   * Get all products in a user's wishlist
   * @param userId User's ID
   * @returns Promise with an array of products
   */
  async getWishlist(userId: string): Promise<Product[]> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
        return [];
      }
      
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push(data.product);
      });
      
      // Sort by date added (newest first)
      return products.sort((a, b) => {
        const dateA = a.dateAdded || 0;
        const dateB = b.dateAdded || 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting wishlist:', error);
      throw error;
    }
  }
  
  /**
   * Remove a product from a user's wishlist
   * @param productId Product ID to remove
   * @returns Promise
   */
  async removeFromWishlist(productId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized');
      }
      
      await deleteDoc(doc(db, this.collectionName, productId));
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      throw error;
    }
  }
  
  /**
   * Find a product in the user's wishlist by matching title and website
   * @param userId User's ID
   * @param product Product to find
   * @returns Promise with the product or null if not found
   */
  private async findProductInWishlist(userId: string, product: Product): Promise<Product | null> {
    try {
      if (!db) {
        console.error('Firestore db is not initialized');
        return null;
      }
      
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        where("product.title", "==", product.title),
        where("product.website", "==", product.website)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      // Return the first matching product
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data.product,
        id: doc.id
      };
    } catch (error) {
      console.error('Error finding product in wishlist:', error);
      return null;
    }
  }

  /**
   * Manually trigger a refresh of the wishlist on the server
   * @param userId User's ID
   * @returns Promise that resolves when the refresh is complete
   */
  async refreshWishlist(userId: string): Promise<void> {
    try {
      console.log('Triggering manual wishlist check for user:', userId);
      
      try {
        // Call the API server endpoint to trigger wishlist check
        const response = await fetch('http://localhost:5000/check-wishlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Wishlist refresh result:', result);
        
        // Even if the API call succeeds, let's also manually check the wishlist
        // and create notifications ourselves to ensure it works
        await this.manuallyCheckAndCreateNotifications(userId);
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // If API fails, do a manual check
        await this.manuallyCheckAndCreateNotifications(userId);
      }
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
      throw error;
    }
  }
  
  /**
   * Manually check wishlist items and create notifications if criteria are met
   * @param userId User's ID
   */
  private async manuallyCheckAndCreateNotifications(userId: string): Promise<void> {
    try {
      // Import notificationService here to avoid circular dependencies
      const { notificationService } = await import('./notifications');
      
      // First, get all of the user's wishlist items
      const products = await this.getWishlist(userId);
      
      if (products.length === 0) {
        // If no products, create a test notification
        await notificationService.createTestNotification(userId);
        return;
      }
      
      let notificationCreated = false;
      
      // Check each product
      for (const product of products) {
        // First check: Only process products that haven't met their target yet
        if (product.targetMet) {
          console.log(`Skipping ${product.title} - target already met`);
          continue;
        }

        const target = product.target || '';
        
        try {
          // If target includes "limit:" or starts with a number, it's a price target
          if (target.toLowerCase().includes('limit:') || /^\s*\d+/.test(target)) {
            console.log(`Checking price target for ${product.title}: ${target}`);
            
            if (product.price) {
              // Extract the price limit from the target string
              let targetPriceStr = target;
              if (target.toLowerCase().includes('limit:')) {
                targetPriceStr = target.split('limit:')[1].trim();
              }
              
              // Parse the price values (remove currency symbols, commas, etc)
              targetPriceStr = targetPriceStr.replace(/[^0-9.]/g, '');
              const currentPriceStr = product.price.replace(/[^0-9.]/g, '');
              
              const targetPrice = parseFloat(targetPriceStr);
              const currentPrice = parseFloat(currentPriceStr);
              
              console.log(`Comparing prices: current=${currentPrice}, target=${targetPrice}`);
              
              // Second check: Check if target price is reached
              if (!isNaN(targetPrice) && !isNaN(currentPrice) && currentPrice <= targetPrice) {
                // Create notification
                await notificationService.createNotification({
                  userId,
                  productId: product.id || 'unknown',
                  productName: product.title,
                  productImage: product.image,
                  productPrice: product.price,
                  type: 'price_alert',
                  message: `Price alert for ${product.title} - Current price ${product.price} matches your target of ${target}`,
                  timestamp: Date.now(),
                  read: false
                });
                notificationCreated = true;
                console.log(`Created price alert notification for ${product.title}`);

                // Set targetMet to true after notification is created
                if (product.id && db) {
                  await updateDoc(doc(db, this.collectionName, product.id), {
                    'product.targetMet': true
                  });
                  console.log(`Marked ${product.title} as target met`);
                }
              }
            }
          } 
          // If target includes "available" or is empty, it's an availability target
          else if (target.toLowerCase().includes('available') || target === '') {
            console.log(`Checking availability target for ${product.title}`);
            
            if (product.availability) {
              const availabilityLower = product.availability.toLowerCase();
              // Second check: Check if availability target is reached
              if (availabilityLower.includes('in stock') || availabilityLower.includes('available')) {
                await notificationService.createNotification({
                  userId,
                  productId: product.id || 'unknown',
                  productName: product.title,
                  productImage: product.image,
                  productPrice: product.price,
                  type: 'availability_alert',
                  message: `${product.title} is available!`,
                  timestamp: Date.now(),
                  read: false
                });
                notificationCreated = true;
                console.log(`Created availability notification for ${product.title}`);

                // Set targetMet to true after notification is created
                if (product.id && db) {
                  await updateDoc(doc(db, this.collectionName, product.id), {
                    'product.targetMet': true
                  });
                  console.log(`Marked ${product.title} as target met`);
                }
              }
            }
          }
          // If we can't determine the target type, don't create notifications
          else {
            console.log(`Skipping notification for ${product.title} - unclear target type: ${target}`);
          }
        } catch (e) {
          console.error(`Error checking product ${product.title}:`, e);
        }
      }
      
      // If no notifications were created, create a test one
      if (!notificationCreated) {
        // Check if the user already has notifications
        const existingNotifications = await notificationService.getNotifications(userId);
        if (existingNotifications.length === 0) {
          // Only create a test notification if there are no existing ones
          await notificationService.createTestNotification(userId);
        }
      }
    } catch (error) {
      console.error('Error in manuallyCheckAndCreateNotifications:', error);
    }
  }
}

// Create and export a singleton instance
export const wishlistService = new WishlistService(); 
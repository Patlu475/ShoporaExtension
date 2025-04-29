from flask import Flask
from firebase_admin import credentials, firestore
import firebase_admin
from apscheduler.schedulers.background import BackgroundScheduler
import requests
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WishlistMonitor:
    def __init__(self):
        # Initialize Firebase Admin if not already done
        if not firebase_admin._apps:
            cred = credentials.Certificate("server/shopbot-a0199-firebase-adminsdk-fbsvc-5d7ef22413.json")
            firebase_admin.initialize_app(cred)
        self.db = firestore.client()
        
    def check_wishlists(self):
        """Check all wishlists and create notifications if needed"""
        logger.info(f"[{datetime.now()}] Starting wishlist check...")
        
        try:
            # Get all wishlist items from root collection
            wishlist_ref = self.db.collection("wishlists")
            wishlist_items = wishlist_ref.stream()
            
            for item in wishlist_items:
                item_data = item.to_dict()
                user_id = item_data.get("userId")
                product = item_data.get("product", {})
                
                if not user_id or not product or not product.get("url"):
                    continue
                
                try:
                    # Use your existing AgentQL API integration
                    current_data = self.scrape_product_data(product.get("url"))
                    
                    if not current_data:
                        continue
                    
                    # Compare with target criteria
                    if self.should_notify_user(product, current_data):
                        # Create notification in Firebase
                        self.create_notification(user_id, product, current_data)
                        
                except Exception as e:
                    logger.error(f"Error processing product {product.get('id')}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Error in wishlist check: {str(e)}")
            
    def scrape_product_data(self, url):
        """Use AgentQL API to scrape product data"""
        try:
            # Use the AgentQL endpoint from api_server.py
            response = requests.post(
                "http://localhost:5000/api/extract/agentql",
                json={"url": url}
            )
            
            if response.status_code != 200:
                logger.error(f"AgentQL API error: {response.text}")
                return None
                
            result = response.json()
            if not result.get("success"):
                logger.error(f"AgentQL extraction failed: {result.get('error')}")
                return None
                
            # Extract relevant data from the response
            data = result.get("data", {})
            return {
                "price": data.get("price", ""),
                "availability": data.get("availability", ""),
                "original_price": data.get("original_price", ""),
                "discount_percentage": data.get("discount_percentage", ""),
                "currency": data.get("currency", "")
            }
            
        except Exception as e:
            logger.error(f"Error scraping product data: {str(e)}")
            return None
        
    def should_notify_user(self, product, current_data):
        """Determine if user should be notified based on target criteria"""
        # Check if we should notify about price
        target_price = product.get("target")
        price_notification = False
        
        if target_price:
            try:
                current_price_str = current_data.get("price", "0")
                # Remove any non-numeric characters except decimal points
                current_price_str = ''.join(c for c in current_price_str if c.isdigit() or c == '.')
                current_price = float(current_price_str) if current_price_str else 0
                
                target_price_str = ''.join(c for c in target_price if c.isdigit() or c == '.')
                target_price = float(target_price_str) if target_price_str else 0
                
                price_notification = current_price <= target_price
            except (ValueError, TypeError) as e:
                logger.error(f"Error comparing prices: {str(e)}")
                pass
        
        # Check if we should notify about availability
        availability_notification = False
        current_availability = current_data.get("availability", "").lower()
        
        # Check if the product is now in stock
        if "in stock" in current_availability or "available" in current_availability:
            # Check if it was previously out of stock or not tracked
            prev_availability = product.get("availability", "").lower()
            if "out of stock" in prev_availability or "sold out" in prev_availability or not prev_availability:
                availability_notification = True
        
        # Return True if either condition is met
        return price_notification or availability_notification
        
    def create_notification(self, user_id, product, current_data):
        """Create notification in Firebase"""
        try:
            # Create notification in root-level 'notifications' collection
            notifications_ref = self.db.collection("notifications")
            notifications_ref.add({
                "userId": user_id,
                "productId": product.get("id"),
                "type": "price_alert",
                "message": f"Price alert for {product.get('title')} - Now ${current_data.get('price')}",
                "timestamp": datetime.now().timestamp(),
                "read": False,
                # Additional fields for UI
                "productName": product.get("title", ""),
                "productImage": product.get("image", ""),
                "productPrice": current_data.get("price", "")
            })
            logger.info(f"Created notification for user {user_id} about {product.get('title')}")
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")

# Create singleton instance
wishlist_monitor = WishlistMonitor()
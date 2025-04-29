import os
import json
import sys
import time
from dotenv import load_dotenv

# Add the project directory to path to allow importing the service
sys.path.append(".")
from entrypoints.services.crawl.serpapi_service import SerpAPIService

def test_serpapi_search():
    """Test the SerpAPI search functionality"""
    # Load environment variables
    load_dotenv()
    
    # Check if the SERPAPI_KEY is set
    serpapi_key = os.getenv("SERPAPI_KEY")
    if not serpapi_key or serpapi_key == "your_serpapi_key_here":
        print("⚠️ Warning: SERPAPI_KEY not set or using placeholder value")
        print("Running in test mode with sample data")
    
    # Create a test product
    test_product = {
        "title": "Apple iPhone 13 Pro Max 256GB Sierra Blue",
        "description": "The iPhone 13 Pro Max features a 6.7-inch Super Retina XDR display with ProMotion, A15 Bionic chip, and a pro camera system.",
        "price": "$1,099.00",
        "website": "apple.com",
        "image": "https://example.com/iphone13.jpg"
    }
    
    # Initialize the SerpAPI service
    serpapi_service = SerpAPIService()
    
    # Start timing
    start_time = time.time()
    
    # Search for similar products
    print(f"🔍 Searching for products similar to: {test_product['title']}")
    result = serpapi_service.search_similar_products(test_product, max_results=5)
    
    # End timing
    elapsed_time = time.time() - start_time
    
    # Print results
    if result.get("success"):
        products = result.get("data", [])
        print(f"✅ Found {len(products)} similar products in {elapsed_time:.2f} seconds")
        
        # Print product details in a neat format
        for i, product in enumerate(products, 1):
            print(f"\n--- Product {i} ---")
            print(f"Title: {product.get('title', 'N/A')}")
            print(f"Price: {product.get('price', 'N/A')}")
            print(f"Website: {product.get('website', 'N/A')}")
            print(f"Link: {product.get('link', 'N/A')}")
    else:
        print(f"❌ Error: {result.get('error')}")

if __name__ == "__main__":
    test_serpapi_search() 
import os
import asyncio
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from .crawler import ProductCrawlService
from .serpapi_service import SerpAPIService
from .utils.agentql_service import AgentQLService
from urllib.parse import urlparse
from apscheduler.schedulers.background import BackgroundScheduler
from .wishlist_monitor import wishlist_monitor

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for browser extension access

# Get API keys from environment
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY is not set in .env file. The crawler may not work properly.")

SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")
if not SERPAPI_KEY:
    print("WARNING: SERPAPI_KEY is not set in .env file. The similar products feature may not work properly.")

AGENTQL_API_KEY = os.environ.get("AGENTQL_API_KEY", "D_2xqurEjZrkiIKYLWx8qPAt_jeksI-QyYZdjYDUFaUcJEWmJQt1hQ")

# Initialize services
serpapi_service = SerpAPIService(SERPAPI_KEY)
agentql_service = AgentQLService(AGENTQL_API_KEY)

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(
    func=wishlist_monitor.check_wishlists,
    trigger="interval",
    minutes=30
)
scheduler.start()

# Don't forget to shut down scheduler when app exits
import atexit
atexit.register(lambda: scheduler.shutdown())

@app.route('/api/crawl', methods=['POST'])
def crawl_endpoint():
    """
    API endpoint for crawling product pages
    
    Expects JSON with:
    {
        "url": "https://example.com/product"
    }
    
    Returns:
    {
        "success": true/false,
        "data": {
            "title": "Product Title",
            "description": "Product Description",
            "price": "Product Price",
            "image": "Product Image URL",
            "website": "Website Domain"
        }
    }
    """
    try:
        data = request.json
        if not data or 'url' not in data:
            return jsonify({
                "success": False,
                "error": "URL is required"
            }), 400
            
        # Get URL from request
        url = data.get('url')
        print(f"[DEBUG] Crawling URL: {url}")
        
        # Extract domain for website field
        parsed_url = urlparse(url)
        website_domain = parsed_url.netloc
        print(f"[DEBUG] Extracted domain: {website_domain}")
        
        # Always use API key from environment
        api_key = OPENAI_API_KEY
        
        # Initialize crawler service with environment API key
        crawler_service = ProductCrawlService(api_key)
        
        # Run the crawler in a synchronous manner
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(crawler_service.crawl_product_page(url))
        loop.close()
        
        print(f"[DEBUG] Initial crawler result: {result}")
        
        # Check for field name mismatches before returning
        if result.get("success") and result.get("data"):
            product_data = result["data"]
            print(f"[DEBUG] Before field correction: {product_data}")
            
            # Force rename name to title if it exists
            if "name" in product_data and "title" not in product_data:
                product_data["title"] = product_data.pop("name")
                print(f"[DEBUG] Converted 'name' to 'title'")
            
            # Detailed price debugging
            if "price" not in product_data or not product_data["price"]:
                print(f"[DEBUG] PRICE FIELD MISSING OR EMPTY")
                # Search for price in other fields
                for key, value in product_data.items():
                    if "price" in key.lower() and key != "price":
                        print(f"[DEBUG] Found potential price field: {key} = {value}")
            else:
                print(f"[DEBUG] PRICE FIELD FOUND: {product_data['price']}")
                
            # Detailed website debugging
            if "website" not in product_data or not product_data["website"]:
                print(f"[DEBUG] WEBSITE FIELD MISSING OR EMPTY")
                # Get domain from URL
                website_domain = urlparse(url).netloc
                print(f"[DEBUG] Setting website from URL: {website_domain}")
                product_data["website"] = website_domain
            else:
                print(f"[DEBUG] WEBSITE FIELD FOUND: {product_data['website']}")
            
            # Ensure all expected fields exist
            for field in ["title", "description", "price", "image", "website"]:
                if field not in product_data:
                    product_data[field] = ""
                    print(f"[DEBUG] Added missing field: {field}")
                elif not product_data[field] and field == "website":
                    # Ensure website is always populated with the domain
                    product_data["website"] = website_domain
                    print(f"[DEBUG] Set website field to: {website_domain}")
            
            # Additional price extraction logic at the API level
            if not product_data.get("price"):
                print(f"[DEBUG] Price field is empty, attempting to find price in other fields")
                # Look for any price-related information in the data
                for key, value in list(product_data.items()):
                    if key not in ["title", "description", "price", "image", "website"] and "price" in key.lower():
                        if isinstance(value, str) and value:
                            product_data["price"] = value
                            print(f"[DEBUG] Found price in field '{key}': {value}")
                            break
            
            print(f"[DEBUG] Final product data: {product_data}")
            
        final_response = jsonify(result)
        print(f"[DEBUG] Sending response: {result}")
        return final_response
        
    except Exception as e:
        print(f"ERROR in crawl_endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/similar-products', methods=['POST'])
def similar_products_endpoint():
    """
    API endpoint for searching similar products using SerpAPI
    
    Expects JSON with either:
    
    Full product details:
    {
        "product": {
            "title": "Product Title",
            "description": "Product Description",
            "price": "Product Price",
            "image": "Product Image URL",
            "website": "Website Domain"
        },
        "max_results": 5  // Optional, defaults to 5
    }
    
    Or a simplified version with just the query:
    {
        "query": "Product search terms",
        "max_results": 5  // Optional, defaults to 5
    }
    
    Returns:
    {
        "success": true/false,
        "data": [
            {
                "title": "Similar Product Title",
                "description": "Similar Product Description",
                "price": "Similar Product Price",
                "image": "Similar Product Image URL",
                "website": "Similar Product Website",
                "link": "Link to similar product"
            },
            ...
        ],
        "source": "serpapi"
    }
    """
    try:
        data = request.json
        print(f"[DEBUG] Received data for similar products: {data}")
        
        if not data:
            print("[ERROR] No data provided in the request")
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
            
        # Get product information from request - support both formats
        product_details = None
        if 'product' in data:
            product_details = data.get('product')
            print(f"[DEBUG] Found product information in request: {product_details}")
        elif 'query' in data:
            query = data.get('query')
            print(f"[DEBUG] Found query in request: {query}")
            product_details = {
                'title': query,
                'description': '',
                'price': '',
                'image': '',
                'website': ''
            }
        
        if not product_details:
            print("[ERROR] No product information or query found in the request")
            return jsonify({
                "success": False,
                "error": "Product information or query is required"
            }), 400
        
        # Check if title is present
        if 'title' not in product_details or not product_details['title']:
            print("[ERROR] Missing required field 'title' in product information")
            return jsonify({
                "success": False,
                "error": "Product title is required"
            }), 400
            
        print(f"[DEBUG] Searching similar products for: {product_details}")
        
        # Get optional max_results parameter
        max_results = int(data.get('max_results', 5))
        print(f"[DEBUG] Using max_results: {max_results}")
        
        # Check if SERPAPI_KEY is set
        if not SERPAPI_KEY:
            print("[WARNING] SERPAPI_KEY not set, using test mode")
            test_mode = True
        else:
            test_mode = False
            print(f"[DEBUG] Using SERPAPI_KEY: {SERPAPI_KEY[:3]}...{SERPAPI_KEY[-3:]}")
        
        # Search for similar products
        result = serpapi_service.search_similar_products(
            product_details=product_details,
            max_results=max_results,
            test_mode=test_mode
        )
        
        print(f"[DEBUG] SerpAPI result: {result}")
        return jsonify(result)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ERROR] In similar_products_endpoint: {str(e)}")
        print(f"[ERROR] Stack trace: {error_trace}")
        return jsonify({
            "success": False,
            "error": str(e),
            "source": "serpapi"
        }), 500

@app.route('/api/extract/agentql', methods=['POST'])
def agentql_extract_endpoint():
    """
    API endpoint for extracting featured product using AgentQL
    
    Expects JSON with:
    {
        "url": "https://example.com/product",
        "include_alternatives": false  // Optional, defaults to false
    }
    
    Returns:
    {
        "success": true/false,
        "data": {
            "title": "Product Title",
            "description": "Product Description",
            "price": "Product Price",
            "image": "Product Image URL",
            "website": "Website Domain",
            "original_price": "Original Price before discount",
            "discount_percentage": "Discount percentage",
            "currency": "Currency symbol",
            "availability": "In stock/Out of stock",
            "rating": "Product rating",
            "review_count": "Number of reviews",
            "sku": "Product SKU",
            "brand": "Product brand"
        },
        "alternatives": [...]  // Only if include_alternatives is true
    }
    """
    try:
        data = request.json
        if not data or 'url' not in data:
            return jsonify({
                "success": False,
                "error": "URL is required"
            }), 400
            
        # Get URL and options from request
        url = data.get('url')
        include_alternatives = data.get('include_alternatives', False)
        print(f"[DEBUG] Extracting with AgentQL URL: {url}, include_alternatives: {include_alternatives}")
        
        # Use the AgentQLService to extract the product
        result = agentql_service.extract_featured_product(url, include_alternatives)
        
        # Return the result
        return jsonify(result)
            
    except Exception as e:
        print(f"ERROR in agentql_extract_endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "api_key_configured": bool(OPENAI_API_KEY),
        "serpapi_key_configured": bool(SERPAPI_KEY)
    })

@app.route("/check-wishlists", methods=["POST"])
def check_wishlists_now():
    try:
        # Get userId from request body if available
        data = request.json if request.is_json else {}
        user_id = data.get('userId') if data else None
        
        if user_id:
            print(f"Manual wishlist check triggered for user: {user_id}")
            # Future enhancement: Check only specific user's wishlist
            # For now, we'll still check all wishlists
        else:
            print("Manual wishlist check triggered for all users")
        
        # Run the wishlist check
        wishlist_monitor.check_wishlists()
        
        return {"status": "success", "message": "Wishlist check completed", "triggered_by": user_id}
    except Exception as e:
        print(f"Error in check_wishlists_now: {str(e)}")
        return {"status": "error", "message": str(e)}, 500

def run_server(host='127.0.0.1', port=5000, debug=False):
    """
    Run the Flask server
    """
    print(f"Starting crawler API server at http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)

if __name__ == "__main__":
    run_server(debug=True) 
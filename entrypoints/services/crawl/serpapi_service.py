import os
import json
import requests
import time
from urllib.parse import quote_plus
import re

class SerpAPIService:
    """
    Service to handle SerpAPI interactions for product searches
    """
    def __init__(self, api_key=None):
        # Get API key from environment if not provided
        self.api_key = api_key or os.environ.get("SERPAPI_KEY", "")
        if not self.api_key:
            print("WARNING: SERPAPI_KEY is not set. The similar products feature may not work properly.")
        
        # Initialize cache
        self._results_cache = {}
        
    def search_similar_products(self, product_details, max_results=5, test_mode=False):
        """
        Search for similar products using Google Shopping via SerpAPI
        
        Args:
            product_details (dict): Dictionary containing product details with keys:
                - title: Product title
                - description: Product description (optional)
                - price: Product price (optional)
                - image: Product image URL (optional)
                - website: Website where product is sold (optional)
                - category: Product category (optional)
                - brand: Brand name (optional)
                - sku: Product SKU (optional)
            max_results (int): Maximum number of results to return
            test_mode (bool): If True, returns sample data instead of making an API call
                
        Returns:
            dict: Search results from Google Shopping, limited to max_results
        """
        # If in test mode, return sample data
        if test_mode or not self.api_key:
            print("Running in test mode or no API key - returning sample data")
            return self._get_sample_data(max_results)
            
        # Check if product_details is valid
        if not product_details or not isinstance(product_details, dict):
            print("Invalid product details provided")
            return {
                "success": False,
                "error": "Invalid product details",
                "source": "serpapi",
                "data": []
            }
        
        # Ensure we at least have a title
        if 'title' not in product_details or not product_details['title']:
            print("Missing required field: title")
            return {
                "success": False,
                "error": "Missing required field: title",
                "source": "serpapi",
                "data": []
            }
        
        # Check cache before making API request
        cache_key = self._generate_cache_key(product_details)
        cached_result = self._get_cached_result(cache_key)
        if cached_result:
            print("Using cached search results")
            return cached_result
        
        # Extract product details
        title = product_details.get('title', '')
        category = product_details.get('category', '')
        brand = product_details.get('brand', '')
        sku = product_details.get('sku', '')
        price = product_details.get('price', '')
        
        # Create search query from product title, brand, category and SKU
        search_terms = []
        
        # Add brand if available (highest priority)
        if brand:
            search_terms.append(brand)
        
        # Extract important keywords from title
        if title:
            # Enhanced stop words list with more common words to filter out
            stop_words = ['the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'a', 'an', 
                         'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
                         'have', 'has', 'had', 'do', 'does', 'did', 'but', 'if', 'because', 'as', 'until',
                         'while', 'from', 'after', 'before', 'above', 'below', 'between', 'under', 'over']
            
            # Remove common product prefixes/suffixes that don't add specificity
            clean_title = re.sub(r'(newest|latest|best|premium|upgraded|professional|official|authentic|original|high quality|improved)\s+', '', title, flags=re.IGNORECASE)
            clean_title = re.sub(r'\s+(version|model|edition|series|collection|bundle|pack|set)', '', clean_title, flags=re.IGNORECASE)
            
            # Split the title and filter out non-meaningful words
            title_words = []
            for word in clean_title.split():
                # Clean the word of punctuation
                word = re.sub(r'[^\w\s]', '', word)
                
                # Only keep words that are not stop words, have more than 2 characters, 
                # and don't consist of only numbers
                if (len(word) > 2 and 
                    word.lower() not in stop_words and 
                    not re.match(r'^\d+$', word)):
                    title_words.append(word)
            
            # Extract model numbers or specific identifiers (alphanumeric combinations)
            model_numbers = re.findall(r'\b[A-Za-z0-9]+-?[A-Za-z0-9]+\b', title)
            for model in model_numbers:
                if len(model) >= 4 and not model.lower() in stop_words:  # Only substantial model numbers
                    if model not in title_words:
                        title_words.append(model)
            
            # Identify key product attributes - size, color, material, etc.
            size_match = re.search(r'\b(\d+(\.\d+)?)\s*(inch|in|cm|mm|ft|foot|feet|meter|m|"|\')\b', title, re.IGNORECASE)
            if size_match:
                size_term = size_match.group(0)
                if size_term not in title_words:
                    title_words.append(size_term)
            
            # Add up to 4 meaningful words from title (increased from 3)
            search_terms.extend(title_words[:4])
        
        # Add SKU if it looks like a model number (not just a generic SKU)
        if sku and re.search(r'[A-Za-z]', sku) and len(sku) > 3:  # Contains letters and is substantial
            search_terms.append(sku)
        
        # Add category if available and specific enough
        if category and len(category) > 3 and category.lower() not in stop_words:
            # Don't add generic categories
            generic_categories = ['product', 'item', 'goods', 'misc', 'other', 'general']
            if not any(gc in category.lower() for gc in generic_categories):
                search_terms.append(category)
        
        # Add exact product type if we can determine it
        product_type_match = None
        if title:
            # Look for common product types that might be more specific than category
            product_types = [
                'monitor', 'keyboard', 'mouse', 'laptop', 'smartphone', 'tablet', 'headphones',
                'earbuds', 'speaker', 'camera', 'printer', 'router', 'watch', 'tv', 'television',
                'refrigerator', 'microwave', 'vacuum', 'blender', 'toaster', 'kettle'
            ]
            for pt in product_types:
                if re.search(r'\b' + pt + r'\b', title.lower()):
                    product_type_match = pt
                    break
        
        if product_type_match and product_type_match not in search_terms:
            search_terms.append(product_type_match)
        
        # Add price range indicator if price is available
        if price:
            # Improved price extraction
            price_value = re.search(r'[\d,.]+', price)
            if price_value:
                try:
                    # Convert to float and calculate price range
                    numeric_price = float(price_value.group().replace(',', ''))
                    min_price = max(0, numeric_price * 0.8)  # 20% below
                    max_price = numeric_price * 1.2  # 20% above
                    
                    # Add price range indicator with more specific format
                    search_terms.append(f"price:{min_price:.0f}-{max_price:.0f}")
                except ValueError:
                    pass  # Skip if conversion fails
        
        # If no search terms were generated, use a fallback
        if not search_terms:
            search_terms = ["product"]
            
        # Clean and join search terms
        search_query = ' '.join(search_terms).strip()
        
        print(f"Searching for similar products with query: {search_query}")
        
        # Set up search parameters with Pakistan location
        params = {
            "api_key": self.api_key,
            "engine": "google_shopping",
            "google_domain": "google.com.pk",  # Using Pakistan domain
            "q": search_query,
            "hl": "en",  # Language set to English
            "gl": "pk",  # Location set to Pakistan
            "location": "Pakistan",  # Explicit location parameter
            "num": str(max_results + 2)  # Request slightly more than needed for better results
        }
        
        # Execute search with retry logic
        max_retries = 2  # Reduced from 3 to improve performance
        retry_delay = 1  # seconds
        
        for attempt in range(max_retries):
            try:
                print(f"Attempting API call (attempt {attempt+1}/{max_retries})...")
                
                # Construct the URL
                base_url = "https://serpapi.com/search"
                query_string = "&".join([f"{k}={quote_plus(str(v))}" for k, v in params.items()])
                url = f"{base_url}?{query_string}"
                
                # Make the request with timeout
                print(f"[DEBUG] Making request to SerpAPI with query: {search_query}")
                response = requests.get(url, timeout=5)
                
                if response.status_code != 200:
                    print(f"[ERROR] API error: {response.status_code}, {response.text}")
                    if response.status_code == 401:
                        raise Exception("SerpAPI authentication failed - check your API key")
                    elif response.status_code == 429:
                        raise Exception("SerpAPI rate limit exceeded - please try again later")
                    else:
                        raise Exception(f"API responded with status: {response.status_code}, message: {response.text[:200]}")
                
                # Parse response
                try:
                    results = response.json()
                except ValueError:
                    print(f"[ERROR] Invalid JSON in API response: {response.text[:200]}...")
                    raise Exception("Invalid JSON response from API")
                
                # Check for error in the response
                if 'error' in results:
                    print(f"[ERROR] API returned error: {results['error']}")
                    raise Exception(f"API error: {results['error']}")
                
                # Limit the number of shopping results to max_results
                if 'shopping_results' in results and isinstance(results['shopping_results'], list):
                    if len(results['shopping_results']) > 0:
                        results['shopping_results'] = results['shopping_results'][:max_results]
                        print(f"[DEBUG] Filtered to top {max_results} results")
                    else:
                        print("[WARNING] SerpAPI returned empty shopping results")
                else:
                    print("[WARNING] No shopping_results field in API response")
                    if 'organic_results' in results:
                        print(f"[DEBUG] Found {len(results.get('organic_results', []))} organic results instead")
                    
                    # Return formatted but empty response
                    return {
                        "success": False,
                        "error": "No shopping results found",
                        "source": "serpapi",
                        "data": []
                    }
                
                formatted_response = self._format_response(results, max_results)
                
                # Cache the results
                self._cache_result(cache_key, formatted_response)
                
                return formatted_response
                
            except requests.exceptions.Timeout:
                print(f"Request timed out (attempt {attempt+1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
            except Exception as e:
                print(f"Error during API call: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
        
        # If all retries fail, return sample data
        print("All API attempts failed, returning sample data")
        return self._get_sample_data(max_results)
    
    def _generate_cache_key(self, product_details):
        """Generate a cache key from product details"""
        key_parts = []
        for field in ['title', 'brand', 'category']:
            if field in product_details and product_details[field]:
                value = str(product_details[field])
                key_parts.append(f"{field}:{value[:20]}")
        return "_".join(key_parts)
    
    def _cache_result(self, key, result):
        """Store result in memory cache"""
        # Store with timestamp
        self._results_cache[key] = {
            'timestamp': time.time(),
            'data': result
        }
    
    def _get_cached_result(self, key):
        """Get cached result if available and not expired"""
        if key in self._results_cache:
            cache_entry = self._results_cache[key]
            # Cache valid for 1 hour
            if time.time() - cache_entry['timestamp'] < 3600:
                return cache_entry['data']
        
        return None

    def _get_sample_data(self, max_results=5):
        """
        Returns sample shopping data for testing purposes
        
        Args:
            max_results (int): Maximum number of results to return
            
        Returns:
            dict: Sample search results limited to max_results
        """
        # Sample data with more than 5 results
        sample_data = {
            "search_metadata": {
                "status": "Success",
                "created_at": "2023-05-02 12:00:00 UTC"
            },
            "search_parameters": {
                "engine": "google_shopping",
                "q": "Sample Product"
            },
            "shopping_results": [
                {
                    "position": 1,
                    "title": "Sample Smartphone 64GB",
                    "price": "$299.99",
                    "source": "samplestore.com",
                    "thumbnail": "https://example.com/sample.jpg",
                    "link": "https://example.com/product1"
                },
                {
                    "position": 2,
                    "title": "Premium Smartphone 128GB",
                    "price": "$499.99",
                    "source": "techstore.com",
                    "thumbnail": "https://example.com/premium.jpg",
                    "link": "https://example.com/product2"
                },
                {
                    "position": 3,
                    "title": "Budget Phone 32GB",
                    "price": "$199.99",
                    "source": "budgetstore.com",
                    "thumbnail": "https://example.com/budget.jpg",
                    "link": "https://example.com/product3"
                },
                {
                    "position": 4,
                    "title": "Flagship Phone 256GB",
                    "price": "$899.99",
                    "source": "premiumstore.com",
                    "thumbnail": "https://example.com/flagship.jpg",
                    "link": "https://example.com/product4"
                },
                {
                    "position": 5,
                    "title": "Gaming Phone 128GB",
                    "price": "$649.99",
                    "source": "gamerstore.com",
                    "thumbnail": "https://example.com/gaming.jpg",
                    "link": "https://example.com/product5"
                },
                {
                    "position": 6,
                    "title": "Camera Phone 64GB",
                    "price": "$549.99",
                    "source": "photostore.com",
                    "thumbnail": "https://example.com/camera.jpg",
                    "link": "https://example.com/product6"
                },
                {
                    "position": 7,
                    "title": "Business Phone 128GB",
                    "price": "$699.99",
                    "source": "businessstore.com",
                    "thumbnail": "https://example.com/business.jpg",
                    "link": "https://example.com/product7"
                }
            ]
        }
        
        # Limit to max_results
        if 'shopping_results' in sample_data:
            sample_data['shopping_results'] = sample_data['shopping_results'][:max_results]
            
        return sample_data

    def _format_response(self, results, max_results=5):
        """
        Formats the response from SerpAPI into a standardized format
        
        Args:
            results (dict): The raw search results from SerpAPI
            max_results (int): Maximum number of results to return
            
        Returns:
            dict: Formatted response with success flag and consistent data structure
        """
        formatted_products = []
        
        if 'shopping_results' in results and isinstance(results['shopping_results'], list):
            # Get up to max_results
            top_results = results['shopping_results'][:max_results]
            
            for result in top_results:
                # Extract reviews content instead of just the count
                review_content = []
                if 'reviews' in result and isinstance(result['reviews'], list):
                    # If reviews field contains actual review content
                    review_content = result['reviews']
                elif 'reviews_detail' in result and isinstance(result['reviews_detail'], list):
                    # Alternative field name that might contain review content
                    review_content = result['reviews_detail']
                elif 'review_highlights' in result and isinstance(result['review_highlights'], list):
                    # Another alternative field name for review highlights
                    review_content = result['review_highlights']
                    
                formatted_product = {
                    'title': result.get('title', 'N/A'),
                    'price': result.get('price', 'N/A'),
                    'description': result.get('snippet', result.get('description', '')),
                    'image': result.get('thumbnail', ''),
                    'website': result.get('source', 'N/A'),
                    'link': result.get('link', '#'),
                    'reviews_count': result.get('reviews', 0),  # Keep track of the count too
                    'reviews_content': review_content,  # Add actual review content
                    'rating': result.get('rating', ''),
                    'availability': result.get('availability', '')
                }
                formatted_products.append(formatted_product)
                
            return {
                "success": True,
                "data": formatted_products,
                "source": "serpapi"
            }
        elif 'error' in results:
            return {
                "success": False,
                "error": results.get('error', 'Unknown error'),
                "source": "serpapi"
            }
        else:
            return {
                "success": False,
                "error": "No shopping results found",
                "source": "serpapi",
                "data": []
            } 
import os
import asyncio
import json
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode, LLMConfig
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from urllib.parse import urlparse
import re
from datetime import datetime


class Product(BaseModel):
    title: str
    description: str
    price: str
    image: str
    website: str
    availability: str = ""
    category: str = ""  # New field for product category
    brand: str = ""     # New field for product brand
    sku: str = ""       # New field for product SKU
    currency: str = ""  # New field for currency
    last_updated: str = ""  # New field for last update timestamp


class ProductCrawlService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
        self.schema_json = json.dumps(Product.model_json_schema())
        self.common_categories = {
            # Electronics
            "phone": ["smartphone", "mobile", "iphone", "android", "samsung", "xiaomi"],
            "laptop": ["laptop", "notebook", "macbook", "chromebook"],
            "tablet": ["tablet", "ipad", "android tablet"],
            "accessories": ["headphones", "earbuds", "charger", "case", "cover"],
            
            # Fashion
            "clothing": ["shirt", "dress", "pants", "jeans", "jacket", "sweater"],
            "shoes": ["sneakers", "boots", "sandals", "heels", "flats"],
            "accessories": ["bag", "wallet", "belt", "watch", "jewelry"],
            
            # Beauty
            "skincare": ["cream", "lotion", "serum", "moisturizer", "cleanser"],
            "makeup": ["lipstick", "mascara", "foundation", "eyeshadow", "blush"],
            "fragrance": ["perfume", "cologne", "body spray", "essential oil"],
            "haircare": ["shampoo", "conditioner", "hair oil", "styling product"],
            
            # Home
            "furniture": ["chair", "table", "sofa", "bed", "cabinet"],
            "decor": ["art", "vase", "candle", "rug", "pillow"],
            "kitchen": ["appliance", "cookware", "utensil", "dish", "pan"],
            
            # Sports
            "equipment": ["dumbbell", "yoga mat", "resistance band", "workout gear"],
            "clothing": ["athletic wear", "sports bra", "running shoes", "gym shorts"],
            
            # Books
            "books": ["book", "novel", "textbook", "comic", "magazine"],
            
            # Toys
            "toys": ["toy", "game", "puzzle", "doll", "action figure"],
            
            # Health
            "supplements": ["vitamin", "supplement", "protein", "mineral"],
            "medical": ["bandage", "first aid", "medicine", "healthcare"],
        }
        
    def _detect_category(self, title: str, description: str) -> str:
        """
        Detect product category based on title and description
        """
        text = f"{title.lower()} {description.lower()}"
        
        # First try exact matches
        for category, keywords in self.common_categories.items():
            if any(keyword in text for keyword in keywords):
                return category
        
        # If no exact match, try partial matches
        for category, keywords in self.common_categories.items():
            if any(keyword.split()[0] in text for keyword in keywords):
                return category
        
        return "other"

    def _extract_currency(self, price: str) -> str:
        """
        Extract currency from price string
        """
        currencies = {
            "$": "USD",
            "€": "EUR",
            "£": "GBP",
            "¥": "JPY",
            "₹": "INR",
            "₽": "RUB"
        }
        
        for symbol, currency in currencies.items():
            if symbol in price:
                return currency
        return "USD"  # Default to USD if no currency found

    def _clean_price(self, price: str) -> str:
        """
        Clean and standardize price format
        """
        if not price:
            return ""
            
        # Remove any non-numeric characters except decimal point and currency symbols
        cleaned = re.sub(r'[^\d.,$€£¥₹₽]', '', price)
        
        # Ensure proper decimal format
        if ',' in cleaned and '.' in cleaned:
            # Handle European format (1.234,56)
            cleaned = cleaned.replace('.', '').replace(',', '.')
        elif ',' in cleaned:
            # Handle US format (1,234.56)
            cleaned = cleaned.replace(',', '')
            
        # Ensure only one decimal point
        parts = cleaned.split('.')
        if len(parts) > 2:
            cleaned = parts[0] + '.' + ''.join(parts[1:])
            
        return cleaned

    async def crawl_product_page(self, url: str) -> Dict[str, Any]:
        """
        Crawl a product page and extract the main product details with improved accuracy
        """
        try:
            # Extract website domain from URL
            parsed_url = urlparse(url)
            website = parsed_url.netloc
            
            # Browser configuration with supported parameters only
            browser_conf = BrowserConfig(
                headless=True,
                viewport_width=1280,
                viewport_height=720,
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            )

            # LLM configuration with improved model
            api_key = self.api_key or os.environ.get("OPENAI_API_KEY", "")
            
            llm_config = LLMConfig(
                provider="openai/gpt-3.5-turbo",  # Use GPT-4 for better accuracy
                api_token=api_key
            )

            # Enhanced LLM-based extraction strategy
            llm_strategy = LLMExtractionStrategy(
                llm_config=llm_config,
                schema=self.schema_json,
                extraction_type="schema",
                instruction="""
                    IMPORTANT: Extract EXACTLY ONE PRODUCT, the main product being displayed on this page.
                    
                    Do NOT extract multiple products. If multiple similar products appear, choose the most 
                    prominently featured one (largest image, most complete description, etc.).
                    
                    You MUST use these EXACT field names:
                    - "title": The product name/title
                    - "description": A concise product description
                    - "price": The current price with currency symbol (e.g., "$129.99")
                    - "image": The URL of the main product image
                    - "website": The website domain (already provided)
                    - "availability": The product's availability status
                    - "category": The specific product category (e.g., "smartphone", "laptop", "skincare")
                    - "brand": The product brand name
                    - "sku": The product SKU or model number
                    - "currency": The currency symbol/code (e.g., "$", "USD", "PKR")
                    
                    CRITICAL EXTRACTION APPROACH:
                    1. Examine the HTML structure to identify product details
                    2. Check for structured data (JSON-LD, microdata, RDFa) first - highest accuracy
                    3. Look for standard e-commerce page elements (title, price, description sections)
                    4. Extract information from meta tags when available
                    5. Check for data attributes that may contain product information
                    
                    CRITICAL FOR TITLE EXTRACTION:
                    1. Look for the most prominent heading (h1) on the page
                    2. Check for title in structured data
                    3. Look for the title in meta tags (especially og:title)
                    4. Check for product titles in breadcrumbs
                    5. Look for title in the document title
                    
                    CRITICAL FOR PRICE EXTRACTION:
                    1. Check for price in structured data (JSON-LD, Schema.org, microdata)
                    2. Look for text with currency symbols ($, €, £, ₹, etc.)
                    3. Look for text with price patterns "$XX.XX" or "XX,XXX"
                    4. Check elements with class or ID containing "price", "cost", "amount"
                    5. If multiple prices appear (original vs. sale), prefer the highlighted/sale price
                    6. Look for price in meta tags (especially og:price)
                    7. Check for price in data attributes (data-price, data-amount)
                    8. Extract both the price value and currency symbol/code
                    
                    CRITICAL FOR IMAGE EXTRACTION:
                    1. Look for the largest product image on the page
                    2. Check for image in structured data
                    3. Look for image in meta tags (especially og:image)
                    4. Prefer high-resolution images when available
                    5. Ensure you extract the full image URL (absolute path)
                    6. Look for image galleries and select the main/first image
                    7. Check for lazy-loaded images in data attributes (data-src)
                    
                    CRITICAL FOR DESCRIPTION EXTRACTION:
                    1. Look for description in structured data
                    2. Check for description in meta tags (especially og:description)
                    3. Look for product description sections/divs
                    4. Check for elements with class or ID containing "description", "details", "specs"
                    5. Limit description to 1-2 sentences for best results
                    6. Remove HTML tags and normalize whitespace
                    
                    CRITICAL FOR AVAILABILITY EXTRACTION:
                    1. Look for availability in structured data
                    2. Check for text mentioning "in stock", "out of stock", "available"
                    3. Look for inventory status indicators
                    4. Check for elements with class or ID containing "availability", "stock", "status"
                    5. Look for color/visual indicators of availability (green text, red text)
                    6. Check for disabled "Add to Cart" buttons (suggests out of stock)
                    
                    CRITICAL FOR CATEGORY EXTRACTION:
                    1. Look for category in breadcrumbs (highest priority)
                    2. Check for category in structured data
                    3. Look for category in meta tags (especially product:category)
                    4. Check for category tags or labels on the page
                    5. Extract from URL path if clearly indicating category
                    6. Look for category in navigation menus that highlight current category
                    7. Use the most specific category (i.e., "Men's Running Shoes" vs just "Shoes")
                    
                    CRITICAL FOR BRAND EXTRACTION:
                    1. Look for brand in structured data (highest priority)
                    2. Check for brand logo or name in header
                    3. Look for brand in product title
                    4. Check for brand in meta tags
                    5. Look for elements with class or ID containing "brand", "manufacturer"
                    6. Check for brand in product description
                    7. Extract full brand name (e.g., "Samsung" not just "S")
                    
                    CRITICAL FOR SKU EXTRACTION:
                    1. Look for SKU in structured data
                    2. Check for product ID, model number, or part number
                    3. Look for text with labels like "SKU:", "Model:", "Item #:"
                    4. Check URL parameters for product ID
                    5. Look for SKU in meta tags
                    6. Check for SKU in data attributes
                    7. Look for product codes in inventory sections
                    
                    CRITICAL FOR CURRENCY EXTRACTION:
                    1. Extract the currency symbol from the price (e.g., $, €, £, ₹)
                    2. If no symbol, check for currency code (USD, EUR, GBP, PKR)
                    3. Look for currency in structured data
                    4. Check meta tags for currency information
                    5. Default to local currency if uncertain (PKR for Pakistan)
                    
                    If you cannot find information for a field, use empty strings.
                    For category, try to be as specific as possible (e.g., "smartphone" instead of "electronics").
                """,
                chunk_token_threshold=1000,
                overlap_rate=0.2,  # Increased overlap for better context
                apply_chunking=True,
                input_format="markdown",
                extra_args={
                    "temperature": 0.1,  # Slightly increased for better context understanding
                    "max_tokens": 1000
                }
            )

            # Optimized crawler run configuration with supported parameters
            run_conf = CrawlerRunConfig(
                extraction_strategy=llm_strategy,
                cache_mode=CacheMode.BYPASS,
                wait_for_images=True,  # Wait for images to load
                page_timeout=30000,  # 30 seconds timeout
                wait_until="domcontentloaded"  # Wait until DOM is loaded
            )

            async with AsyncWebCrawler(config=browser_conf) as crawler:
                # Execute the crawl
                result = await crawler.arun(url=url, config=run_conf)

                if result.success:
                    try:
                        # Parse the extracted content
                        raw_data = json.loads(result.extracted_content)
                        print(f"RAW DATA FROM CRAWLER: {raw_data}")
                        
                        # Ensure we're dealing with a single product
                        if isinstance(raw_data, list) and len(raw_data) > 0:
                            raw_data = raw_data[0]
                        
                        # Create a clean product with all fields
                        clean_product = {
                            "title": "",
                            "description": "",
                            "price": "",
                            "image": "",
                            "website": website,
                            "availability": "",
                            "category": "",
                            "brand": "",
                            "sku": "",
                            "currency": "",
                            "last_updated": datetime.now().isoformat()
                        }
                        
                        # Map fields from raw_data to clean_product
                        for field in clean_product.keys():
                            if field in raw_data and raw_data[field]:
                                clean_product[field] = raw_data[field]
                        
                        # Clean and standardize price
                        if clean_product["price"]:
                            clean_product["price"] = self._clean_price(clean_product["price"])
                            clean_product["currency"] = self._extract_currency(clean_product["price"])
                        
                        # Detect category if not provided
                        if not clean_product["category"]:
                            clean_product["category"] = self._detect_category(
                                clean_product["title"],
                                clean_product["description"]
                            )
                        
                        # Try to extract brand from title if not provided
                        if not clean_product["brand"] and clean_product["title"]:
                            # Common brand names to look for
                            common_brands = ["apple", "samsung", "sony", "nike", "adidas", "amazon"]
                            title_lower = clean_product["title"].lower()
                            for brand in common_brands:
                                if brand in title_lower:
                                    clean_product["brand"] = brand.capitalize()
                                    break
                       
                        # Try to extract SKU from URL if not provided
                        if not clean_product["sku"]:
                            # Look for product ID in URL
                            url_parts = url.split('/')
                            for part in url_parts:
                                if part.isdigit() or re.match(r'^[A-Z0-9-]+$', part):
                                    clean_product["sku"] = part
                                break
                            
                        print(f"CLEAN PRODUCT: {clean_product}")
                        
                        return {
                            "success": True,
                            "data": clean_product
                        }
                    except Exception as processing_error:
                        print(f"Error processing extraction result: {processing_error}")
                        return {
                            "success": True,
                            "data": {
                                "title": "Extraction Processing Error",
                                "description": str(processing_error),
                                "price": "",
                                "image": "",
                                "website": website,
                                "availability": "",
                                "category": "",
                                "brand": "",
                                "sku": "",
                                "currency": "",
                                "last_updated": datetime.now().isoformat()
                            }
                        }
                else:
                    return {
                        "success": False,
                        "error": result.error_message or "Unknown error during crawling"
                    }
        except Exception as e:
            print(f"CRAWLER ERROR: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }


# Test function
async def test_crawler(url: str, api_key: Optional[str] = None):
    service = ProductCrawlService(api_key)
    result = await service.crawl_product_page(url)
    if result["success"]:
        print("Extracted product data:", json.dumps(result["data"], indent=2))
    else:
        print("Error:", result["error"])
    return result


# Test function that can be called directly
if __name__ == "__main__":
    test_url = "https://outfitters.com.pk/collections/men-jeans-trousers-new-arrivals/products/f0486-109?variant=44091329544383"
    asyncio.run(test_crawler(test_url)) 
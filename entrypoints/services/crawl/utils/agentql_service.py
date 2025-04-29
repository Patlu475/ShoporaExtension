import requests
import json
from urllib.parse import urlparse

class AgentQLService:
    """
    Service for extracting product data from e-commerce sites using AgentQL.
    """
    
    def __init__(self, api_key):
        """
        Initialize the AgentQL service.
        
        Args:
            api_key (str): The AgentQL API key
        """
        self.api_key = api_key
        self.api_endpoint = "https://api.agentql.com/v1/query-data"
    
    def extract_featured_product(self, url, include_alternatives=False):
        """
        Extract the main featured product from an eCommerce URL using AgentQL.
        
        Args:
            url (str): The eCommerce website URL
            include_alternatives (bool): Whether to include alternative/related products
            
        Returns:
            dict: The extraction results with the featured product information
        """
        # Headers for the request
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Build the query based on whether alternatives should be included
        if include_alternatives:
            query = """
            {
                featured_product {
                    name
                    description
                    price(float)
                    original_price(float)
                    discount_percentage(float)
                    image_url
                    currency
                    availability
                    rating(float)
                    review_count(integer)
                    sku
                    brand
                    top_customer_reviews[] {
                        username
                        review
                        rating
                    }
                }
                
            }
            """
        else:
            query = """
            {
                featured_product {
                    name
                    description
                    price(float)
                    original_price(float)
                    discount_percentage(float)
                    image_url
                    currency
                    availability
                    rating(float)
                    review_count(integer)
                    sku
                    brand
                    top_customer_reviews[] {
                        username
                        review
                        rating
                    }
                }
               
            }
            """
        
        # Prepare the request payload
        payload = {
            "url": url,
            "query": query
        }
        
        # Extract domain for website field
        parsed_url = urlparse(url)
        website_domain = parsed_url.netloc
        
        # Make the API request
        try:
            response = requests.post(self.api_endpoint, headers=headers, json=payload)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            # Parse the JSON response
            result = response.json()
            
            # Extract the featured product
            if 'data' in result and 'featured_product' in result['data']:
                product_data = result['data']['featured_product']
                
                # Map AgentQL fields to our standard fields
                mapped_data = {
                    "title": product_data.get("name", ""),
                    "description": product_data.get("description", ""),
                    "price": str(product_data.get("price", "")),
                    "image": product_data.get("image_url", ""),
                    "website": website_domain,
                    "original_price": str(product_data.get("original_price", "")),
                    "discount_percentage": product_data.get("discount_percentage", ""),
                    "currency": product_data.get("currency", ""),
                    "availability": product_data.get("availability", ""),
                    "rating": product_data.get("rating", ""),
                    "review_count": product_data.get("review_count", ""),
                    "sku": product_data.get("sku", ""),
                    "brand": product_data.get("brand", "")
                }
                
                response_data = {
                    "success": True,
                    "data": mapped_data,
                }
                
                # Add reviews if available in the response
                if 'top_customer_reviews' in product_data and product_data['top_customer_reviews']:
                    reviews = product_data['top_customer_reviews']
                    mapped_reviews = []
                    
                    for review in reviews:
                        mapped_review = {
                            "username": review.get("username", ""),
                            "review": review.get("review", ""),
                            "rating": review.get("rating", "")
                        }
                        mapped_reviews.append(mapped_review)
                    
                    response_data["reviews"] = mapped_reviews
                
                # Add alternatives if requested and available
                if include_alternatives and 'alternative_products' in result['data']:
                    alternative_products = result['data']['alternative_products']
                    mapped_alternatives = []
                    
                    for alt_product in alternative_products:
                        mapped_alt = {
                            "title": alt_product.get("name", ""),
                            "price": str(alt_product.get("price", "")),
                            "image": alt_product.get("image_url", ""),
                            "rating": alt_product.get("rating", "")
                        }
                        mapped_alternatives.append(mapped_alt)
                    
                    response_data["alternatives"] = mapped_alternatives
                
                return response_data
            else:
                return {
                    "success": False,
                    "error": "No featured product found in the response"
                }
                
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response content: {e.response.text}")
            return {
                "success": False,
                "error": f"HTTP Error: {str(e)}"
            }
        except requests.exceptions.ConnectionError:
            print("Connection Error: Failed to establish a connection to the API")
            return {
                "success": False,
                "error": "Connection Error: Failed to establish a connection to the API"
            }
        except requests.exceptions.Timeout:
            print("Timeout Error: Request timed out")
            return {
                "success": False,
                "error": "Timeout Error: Request timed out"
            }
        except requests.exceptions.RequestException as e:
            print(f"Error making request: {e}")
            return {
                "success": False,
                "error": f"Error making request: {str(e)}"
            }
        except json.JSONDecodeError:
            print("Error decoding JSON response")
            return {
                "success": False,
                "error": "Error decoding JSON response"
            }
    
    def execute_custom_query(self, url, query):
        """
        Execute a custom AgentQL query on the specified URL.
        
        Args:
            url (str): The website URL to query
            query (str): The AgentQL query
            
        Returns:
            dict: The raw AgentQL response
        """
        # Headers for the request
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Prepare the request payload
        payload = {
            "url": url,
            "query": query
        }
        
        # Make the API request
        try:
            response = requests.post(self.api_endpoint, headers=headers, json=payload)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            # Parse the JSON response
            return {
                "success": True,
                "data": response.json()
            }
                
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response content: {e.response.text}")
            return {
                "success": False,
                "error": f"HTTP Error: {str(e)}"
            }
        except requests.exceptions.ConnectionError:
            print("Connection Error: Failed to establish a connection to the API")
            return {
                "success": False,
                "error": "Connection Error: Failed to establish a connection to the API"
            }
        except requests.exceptions.Timeout:
            print("Timeout Error: Request timed out")
            return {
                "success": False,
                "error": "Timeout Error: Request timed out"
            }
        except requests.exceptions.RequestException as e:
            print(f"Error making request: {e}")
            return {
                "success": False,
                "error": f"Error making request: {str(e)}"
            }
        except json.JSONDecodeError:
            print("Error decoding JSON response")
            return {
                "success": False,
                "error": "Error decoding JSON response"
            } 
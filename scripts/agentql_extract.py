#!/usr/bin/env python3
import requests
import argparse
import json
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def extract_featured_product(url, include_alternatives=False):
    """
    Extract the main featured product from an eCommerce URL using AgentQL.
    
    Args:
        url (str): The eCommerce website URL
        include_alternatives (bool): Whether to include alternative/related products
        
    Returns:
        dict: The featured product information
    """
    # AgentQL API endpoint
    api_endpoint = "https://api.agentql.com/v1/query-data"
    
    # Your AgentQL API key - first try environment variable, then use default
    api_key = os.environ.get("AGENTQL_API_KEY", "D_2xqurEjZrkiIKYLWx8qPAt_jeksI-QyYZdjYDUFaUcJEWmJQt1hQ")
    
    # Headers for the request
    headers = {
        "X-API-Key": api_key,
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
                specifications()
            }
            alternative_products[] {
                name
                price(float)
                image_url
                rating(float)
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
    
    # Make the API request
    try:
        response = requests.post(api_endpoint, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse the JSON response
        result = response.json()
        
        # Extract domain for website field
        parsed_url = urlparse(url)
        website_domain = parsed_url.netloc
        
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
                
                mapped_data["reviews"] = mapped_reviews
            
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
                
                mapped_data["alternatives"] = mapped_alternatives
            
            # Pretty print the result
            print(json.dumps(mapped_data, indent=2))
            
            return mapped_data
            
        else:
            print("No featured product found in the response.")
            if 'data' in result:
                print("Available data keys:", result['data'].keys())
            return None
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response content: {e.response.text}")
        return None
    except requests.exceptions.ConnectionError:
        print("Connection Error: Failed to establish a connection to the API")
        return None
    except requests.exceptions.Timeout:
        print("Timeout Error: Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None
    except json.JSONDecodeError:
        print("Error decoding JSON response")
        return None

if __name__ == "__main__":
    # Set up command line argument parsing
    parser = argparse.ArgumentParser(description="Extract the main featured product from an eCommerce website using AgentQL")
    parser.add_argument("url", help="The URL of the eCommerce website")
    parser.add_argument("--alternatives", "-a", action="store_true", 
                        help="Include alternative/related products in the results")
    parser.add_argument("--save", "-s", metavar="FILENAME", 
                        help="Save the results to a JSON file")
    
    # Parse the arguments
    args = parser.parse_args()
    
    # Extract the featured product
    product_data = extract_featured_product(args.url, args.alternatives)
    
    # Save results to file if requested
    if args.save and product_data:
        with open(args.save, 'w', encoding='utf-8') as f:
            json.dump(product_data, f, indent=2)
        print(f"Results saved to {args.save}") 
import os
from entrypoints.services.crawl.api_server import run_server

if __name__ == "__main__":
    # Set host and port from environment if available
    host = os.environ.get("CRAWLER_HOST", "127.0.0.1")
    port = int(os.environ.get("CRAWLER_PORT", 5000))
    debug = os.environ.get("CRAWLER_DEBUG", "False").lower() == "true"
    
    print(f"Starting crawler API server on {host}:{port} (debug={debug})")
    run_server(host=host, port=port, debug=debug) 
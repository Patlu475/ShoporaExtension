# ShopBot Extension

A browser extension that extracts product information from shopping websites and finds similar products.

## Features

- Product extraction from e-commerce sites
- OpenAI API integration for accurate product data extraction
- Similar product search using SerpAPI
- Easy-to-use UI with scan button and results display
- Supports Chrome and other modern browsers

## Setup

### Extension Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Build the extension:
   ```
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `.output/chrome-mv3` folder

### Backend Crawler Service Setup

The extension uses a Python backend service for web crawling and product extraction.

1. Install Python 3.8+ if not already installed

2. Install the required Python packages:
   ```
   pip install -r python-requirements.txt
   ```

3. Configure the API keys:
   - Create a `.env` file in the root directory (or edit the existing one)
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```
   - Add your SerpAPI key (get one at https://serpapi.com/):
     ```
     SERPAPI_KEY=your_serpapi_key_here
     ```

4. Start the crawler API server:
   ```
   python start_crawler_server.py
   ```

5. The server should be running at http://127.0.0.1:5000

## Usage

1. Navigate to any product page on a shopping website

2. Click on the ShopBot extension icon in your browser toolbar

3. Click the "Scan for Products" button

4. View the extracted product information

5. Click "Search Similar" on any product card to find similar products across different websites

## Testing

You can test the SerpAPI integration independently:

```
python test_serpapi.py
```

## Security

The API keys (OpenAI and SerpAPI) are stored only in the backend `.env` file and are never exposed to the frontend. All API requests are made through the backend Python service.

## Development

### Extension Development

```
npm run dev
```

### API Server Development

```
python start_crawler_server.py
```

## Technologies Used

- TypeScript
- WXT for extension development
- Tailwind CSS for styling
- Python with Flask for the backend API
- Crawl4AI for web crawling and extraction
- OpenAI API for AI-powered extraction
- SerpAPI for similar product search

## License

MIT

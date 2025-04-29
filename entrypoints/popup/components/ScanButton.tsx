import React from 'react';
import { toast } from 'react-hot-toast';
import browser from 'webextension-polyfill';
import { ExtractionStrategy } from '../../services/product-extractor';

// Define response type
interface ExtractResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface ScanButtonProps {
  isLoading: boolean;
  onClick?: () => void;
  text?: string;
  icon?: string;
  loadingText?: string;
  onExtracted?: (data: any) => void;
  setIsLoading: (isLoading: boolean) => void;
  strategy: ExtractionStrategy;
  setStrategy: (strategy: ExtractionStrategy) => void;
}

export const ScanButton: React.FC<ScanButtonProps> = ({ 
  isLoading, 
  onClick, 
  text = 'Scan Products',
  icon = '🔍',
  loadingText = 'Scanning...',
  onExtracted,
  setIsLoading,
  strategy,
  setStrategy
}) => {
  const handleScan = async () => {
    try {
      setIsLoading(true);
      
      // Get the current active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab?.url) {
        toast.error('No active tab URL found');
        setIsLoading(false);
        return;
      }
      
      console.log(`Scanning URL: ${activeTab.url} using AgentQL strategy`);
      
      // Always use AgentQL for extraction regardless of strategy setting
      const response = await browser.runtime.sendMessage({
        action: 'extractWithAgentQL',
        url: activeTab.url,
        includeAlternatives: true
      }) as ExtractResponse;
      
      // Process response
      console.log('Extraction response:', response);
      
      if (response && response.success) {
        // Handle successful extraction
        if (onExtracted && response.data) {
          onExtracted(response.data);
        }
        
        toast.success('Product extracted successfully!');
      } else {
        // Handle extraction error
        const errorMessage = response?.error || 'Unknown error during extraction';
        console.error('Extraction error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error during scan:', error);
      toast.error(error instanceof Error ? error.message : 'Unknown error during scan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onClick || handleScan}
        disabled={isLoading}
        className="bg-gradient-to-r from-blue-500 to-violet-500 no-underline group cursor-pointer relative shadow-md shadow-blue-500/20 rounded-full p-px text-sm font-medium leading-5 text-white inline-block disabled:opacity-90 disabled:cursor-not-allowed transform hover:scale-105 transition-transform duration-200"
      >
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className={`absolute inset-0 rounded-full ${isLoading ? 'animate-pulse bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)]' : 'bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100'}`} />
        </span>
        <div className="relative flex space-x-1 items-center z-10 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 py-2 px-5 ring-1 ring-white/10">
          {isLoading ? (
            <>
              <svg className="w-4 h-4 mr-1 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 30" strokeDashoffset="0">
                  <animateTransform 
                    attributeName="transform" 
                    type="rotate"
                    dur="1s" 
                    from="0 12 12"
                    to="360 12 12" 
                    repeatCount="indefinite" 
                  />
                </path>
              </svg>
              <span className="inline-flex items-center text-sm">
                {loadingText}
                <span className="ml-1">
                  <span className="animate-ping inline-flex rounded-full h-1 w-1 bg-white"></span>
                  <span className="animate-ping inline-flex rounded-full h-1 w-1 bg-white delay-150"></span>
                  <span className="animate-ping inline-flex rounded-full h-1 w-1 bg-white delay-300"></span>
                </span>
              </span>
            </>
          ) : (
            <>
              {icon && <span className="mr-1">{icon}</span>}
              <span>{text}</span>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </>
          )}
        </div>
        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-400/0 via-blue-400/90 to-blue-400/0 transition-opacity duration-500 group-hover:opacity-40" />
      </button>
      
      {/* Extraction Strategy Selector */}
      <div className="mt-2 flex justify-center">
        <div className="inline-flex items-center bg-blue-50 rounded-full p-1 text-xs">
          <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-full relative flex items-center">
            <span>Using AgentQL</span>
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] px-1 rounded-full">Default</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanButton; 
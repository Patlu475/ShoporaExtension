import React, { memo } from 'react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = memo(({ 
  message = 'Loading ShopBot...',
  subMessage = 'Please wait while we initialize' 
}) => {
  // Simplified logo without excessive animations for faster initial render
  return (
    <div className="min-h-[600px] w-[350px] bg-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-5 p-6">
        {/* ShopBot Logo with simplified animation */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text">{message}</h2>
          <p className="text-sm text-gray-500 mt-2">{subMessage}</p>
        </div>
        
        {/* Simple Loading Spinner - less CPU intensive */}
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen; 
import React from 'react';

interface StatusAreaProps {
  message: string;
  isSuccess: boolean;
  isHidden: boolean;
  onClose?: () => void;
}

const StatusArea: React.FC<StatusAreaProps> = ({
  message,
  isSuccess,
  isHidden,
  onClose
}) => {
  if (isHidden || !message) {
    return null;
  }

  return (
    <div className={`rounded-lg p-3 ${isSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {isSuccess ? (
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )}
          <span className="text-sm">{message}</span>
        </div>
        <button 
          onClick={onClose} 
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StatusArea; 
import React from 'react';
import { IconSearch } from '@tabler/icons-react';
import { cn } from '../utils/cn';

interface MiniScanButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

const MiniScanButton: React.FC<MiniScanButtonProps> = ({ isLoading, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="bg-gradient-to-r from-blue-500 to-violet-500 no-underline relative shadow-md shadow-blue-500/20 rounded-full px-3 py-1.5 text-xs font-medium text-white inline-flex items-center space-x-1 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 transition-transform duration-200"
    >
      {isLoading ? (
        <svg className="w-3 h-3 mr-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <IconSearch className="w-3 h-3 mr-1" stroke={2} />
      )}
      <span>{isLoading ? 'Scanning...' : 'Scan again'}</span>
    </button>
  );
};

export default MiniScanButton; 
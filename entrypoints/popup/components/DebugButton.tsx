import React from 'react';

interface DebugButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

const DebugButton: React.FC<DebugButtonProps> = ({ onClick, isActive = false }) => {
  return (
    <div className="debug-buttons">
      <button 
        className={`debug-button ${isActive ? 'bg-blue-600' : 'bg-gray-600'}`} 
        onClick={onClick}
      >
        Debug
      </button>
    </div>
  );
};

export default DebugButton; 
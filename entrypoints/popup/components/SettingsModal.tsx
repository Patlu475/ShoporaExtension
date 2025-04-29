import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEngine?: string;
  onEngineChange?: (engine: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentEngine = 'crawl4ai',
  onEngineChange = () => {}
}) => {
  const [selectedEngine, setSelectedEngine] = useState(currentEngine);

  const handleEngineChange = (engine: string) => {
    setSelectedEngine(engine);
  };

  const handleSave = () => {
    onEngineChange(selectedEngine);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500">
          <h2 className="text-lg font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-2">Scanning Engine</h3>
            <p className="text-xs text-gray-500 mb-2">
              Select the scanning engine for product detection
            </p>
            
            <div className="space-y-2">
              <div 
                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                  selectedEngine === 'crawl4ai' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleEngineChange('crawl4ai')}
              >
                <div className={`h-4 w-4 rounded-full mr-3 border flex items-center justify-center ${
                  selectedEngine === 'crawl4ai' 
                    ? 'border-blue-500' 
                    : 'border-gray-400'
                }`}>
                  {selectedEngine === 'crawl4ai' && (
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">Crawl4AI</div>
                  <div className="text-xs text-gray-500">Standard product extraction engine</div>
                </div>
              </div>
              
              <div 
                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                  selectedEngine === 'agentql' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleEngineChange('agentql')}
              >
                <div className={`h-4 w-4 rounded-full mr-3 border flex items-center justify-center ${
                  selectedEngine === 'agentql' 
                    ? 'border-blue-500' 
                    : 'border-gray-400'
                }`}>
                  {selectedEngine === 'agentql' && (
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">AgentQL</div>
                  <div className="text-xs text-gray-500">Advanced AI-powered extraction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 text-right">
          <button
            className="mr-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 
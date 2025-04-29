import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface AlertPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (target: string) => void;
  productTitle: string;
  isAvailable: boolean;
  currentPrice?: string;
}

const AlertPreferencesModal: React.FC<AlertPreferencesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productTitle,
  isAvailable,
  currentPrice
}) => {
  const [targetPrice, setTargetPrice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAvailable) {
      // For price alerts
      if (!targetPrice) {
        toast.error('Please enter a target price');
        return;
      }
      // Format: "limit:2300"
      onConfirm(`limit:${targetPrice}`);
    } else {
      // For availability alerts
      onConfirm('available');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Alert Preferences
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {isAvailable 
            ? `Set a target price for ${productTitle}`
            : `Get notified when ${productTitle} becomes available`
          }
        </p>

        {isAvailable && (
          <div className="mb-4">
            <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Target Price
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="targetPrice"
                id="targetPrice"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                min="0"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">USD</span>
              </div>
            </div>
            {currentPrice && (
              <p className="mt-1 text-xs text-gray-500">
                Current price: {currentPrice}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertPreferencesModal; 
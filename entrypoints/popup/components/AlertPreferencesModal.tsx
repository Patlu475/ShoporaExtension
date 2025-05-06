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

        <form onSubmit={handleSubmit}>
          {isAvailable ? (
            <div className="mb-4">
              <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Target Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="targetPrice"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter target price"
                  step="0.01"
                  min="0"
                />
              </div>
              {currentPrice && (
                <p className="mt-1 text-sm text-gray-500">
                  Current price: ${currentPrice}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">
              We'll notify you as soon as this product becomes available.
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertPreferencesModal; 
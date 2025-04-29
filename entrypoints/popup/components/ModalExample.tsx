import React, { useState } from 'react';
import { Modal } from './Modal';

export const ModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg'>('md');

  const openModal = (size: 'sm' | 'md' | 'lg') => {
    setModalSize(size);
    setIsOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => openModal('sm')}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Open Small Modal
        </button>
        <button
          onClick={() => openModal('md')}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Open Medium Modal
        </button>
        <button
          onClick={() => openModal('lg')}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Open Large Modal
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        size={modalSize}
      >
        <div className="p-4">
          <p className="text-gray-700">
            This is an example modal with different size options. It includes animations, focus trapping, and 
            accessibility features. You can close it by clicking outside, pressing the Escape key, or using 
            the close button.
          </p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Form example</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Type something..."
            />
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Close Modal
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 
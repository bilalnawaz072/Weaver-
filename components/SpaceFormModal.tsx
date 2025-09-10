import React, { useState, useEffect } from 'react';
import { Space } from '../types';
import { XMarkIcon } from './icons';

interface SpaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spaceData: { name: string; }) => void;
  spaceToEdit: Space | null;
}

export const SpaceFormModal: React.FC<SpaceFormModalProps> = ({ isOpen, onClose, onSave, spaceToEdit }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (spaceToEdit) {
            setName(spaceToEdit.name);
        } else {
            setName('');
        }
        setError('');
    }
  }, [isOpen, spaceToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Space name cannot be empty.');
      return;
    }
    onSave({ name });
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 transition-opacity duration-300"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 p-6 sm:p-8 rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-lg relative border-t sm:border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <XMarkIcon />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-white">{spaceToEdit ? 'Edit Space' : 'Create New Space'}</h2>
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Space Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g., Product Development"
            />
          </div>
          <div className="flex justify-end pt-4 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
            >
              Save Space
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
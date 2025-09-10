import React from 'react';
import { MagnifyingGlassIcon } from '../icons';

interface GlobalSearchBarProps {
  onClick: () => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-64 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-2 transition-colors"
      aria-label="Search"
    >
      <div className="flex items-center space-x-2">
        <MagnifyingGlassIcon className="w-4 h-4" />
        <span>Search...</span>
      </div>
      <kbd className="font-sans text-xs font-semibold text-gray-500 border border-gray-600 rounded px-1.5 py-0.5">
        ⌘ K
      </kbd>
    </button>
  );
};

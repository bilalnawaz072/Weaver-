import React, { useState, useEffect, useRef } from 'react';
import { SearchableEntity } from '../../types';
import { XMarkIcon, MagnifyingGlassIcon } from '../icons';
import { SynthesizedAnswer } from './SynthesizedAnswer';
import { ResultCard } from './ResultCard';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
  synthesizedAnswer: string;
  results: SearchableEntity[];
  onResultClick: (item: SearchableEntity) => void;
}

export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  isSearching,
  synthesizedAnswer,
  results,
  onResultClick,
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Reset query when opening and focus input
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  if (!isOpen) return null;

  const groupedResults = results.reduce((acc, result) => {
    const key = result.entityType;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, SearchableEntity[]>);


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start pt-20 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, documents, projects..."
            className="w-full bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none"
          />
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close search">
              <XMarkIcon />
            </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
            {query && (isSearching || synthesizedAnswer) && (
                <div className="p-6 border-b border-gray-700">
                    <SynthesizedAnswer answer={synthesizedAnswer} isLoading={isSearching && !synthesizedAnswer} />
                </div>
            )}
            
            <div className="p-6">
                {isSearching && results.length === 0 && !synthesizedAnswer && <p className="text-gray-400 text-center py-4">Searching...</p>}
                {!isSearching && query && results.length === 0 && <p className="text-gray-400 text-center py-4">No results found for "{query}"</p>}
                {!query && <p className="text-gray-400 text-center py-4">Start typing to search your workspace.</p>}

                {Object.entries(groupedResults).map(([type, items]) => (
                    <div key={type} className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 capitalize">{type}s</h3>
                        <ul className="space-y-2">
                            {items.map(item => (
                                <li key={`${item.entityType}-${item.id}`}>
                                    <ResultCard item={item} onClick={onResultClick} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

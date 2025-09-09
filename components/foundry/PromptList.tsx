import React from 'react';
import { Prompt } from '../../types';
import { PlusIcon, BeakerIcon } from '../icons';

interface PromptListProps {
    prompts: Prompt[];
    selectedPromptId: string | null;
    onSelectPrompt: (id: string) => void;
    onCreatePrompt: () => void;
}

export const PromptList: React.FC<PromptListProps> = ({ prompts, selectedPromptId, onSelectPrompt, onCreatePrompt }) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <BeakerIcon className="w-6 h-6 text-gray-400" />
                    <h2 className="text-xl font-bold text-white">Prompts</h2>
                </div>
                <button
                    onClick={onCreatePrompt}
                    className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                    aria-label="Create new prompt"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <nav className="flex-grow overflow-y-auto -mr-2 pr-2">
                {prompts.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>No prompts yet. Create one to begin!</p>
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {prompts.map(prompt => (
                            <li key={prompt.id}>
                                <button
                                    onClick={() => onSelectPrompt(prompt.id)}
                                    className={`w-full text-left p-2.5 rounded-md text-sm transition-colors ${
                                        selectedPromptId === prompt.id
                                            ? 'bg-indigo-600 text-white font-semibold'
                                            : 'text-gray-300 hover:bg-gray-700/50'
                                    }`}
                                >
                                    <p className="truncate font-medium">{prompt.name}</p>
                                    <p className={`truncate text-xs ${selectedPromptId === prompt.id ? 'text-indigo-200' : 'text-gray-400'}`}>{prompt.description || 'No description'}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </nav>
        </div>
    );
};

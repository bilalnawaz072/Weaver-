import React from 'react';
import { Prompt } from '../../types';
import { PromptList } from './PromptList';
import { PromptEditor } from './PromptEditor';

interface FoundryViewProps {
    prompts: Prompt[];
    selectedPrompt: Prompt | null;
    onSelectPrompt: (id: string) => void;
    onCreatePrompt: () => void;
    onSavePrompt: (promptData: Omit<Prompt, 'createdAt' | 'updatedAt'>) => void;
    onDeletePrompt: (id: string) => void;
    onRunPrompt: (promptText: string, variables: { [key: string]: string }) => Promise<string>;
}

export const FoundryView: React.FC<FoundryViewProps> = (props) => {
    const { prompts, selectedPrompt, onSelectPrompt, onCreatePrompt, onSavePrompt, onDeletePrompt, onRunPrompt } = props;

    return (
        <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex gap-6 overflow-hidden">
            <div className="w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0">
                <PromptList 
                    prompts={prompts}
                    selectedPromptId={selectedPrompt?.id || null}
                    onSelectPrompt={onSelectPrompt}
                    onCreatePrompt={onCreatePrompt}
                />
            </div>
            <div className="flex-grow flex flex-col overflow-hidden">
                {selectedPrompt ? (
                    <PromptEditor 
                        key={selectedPrompt.id} // Re-mount component when prompt changes
                        prompt={selectedPrompt}
                        onSave={onSavePrompt}
                        onDelete={onDeletePrompt}
                        onRunPrompt={onRunPrompt}
                    />
                ) : (
                    <div className="flex-grow flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-white">No Prompt Selected</h2>
                            <p className="text-gray-400 mt-2">Select a prompt from the list, or create a new one to get started.</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};
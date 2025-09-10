import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Prompt } from '../../types';
import { TrashIcon } from '../icons';
import { TestConsole } from './TestConsole';

// Custom hook for debouncing
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
    const timeoutRef = useRef<number | null>(null);

    const debouncedCallback = useCallback((...args: any[]) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => callback(...args), delay);
    }, [callback, delay]);

    return debouncedCallback;
};


interface PromptEditorProps {
    prompt: Prompt;
    onSave: (promptData: Omit<Prompt, 'createdAt' | 'updatedAt'>) => void;
    onDelete: (id: string) => void;
    onRunPrompt: (promptText: string, variables: { [key: string]: string }) => Promise<string>;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onDelete, onRunPrompt }) => {
    const [name, setName] = useState(prompt.name);
    const [description, setDescription] = useState(prompt.description);
    const [promptText, setPromptText] = useState(prompt.promptText);
    const [contextVariableName, setContextVariableName] = useState(prompt.contextVariableName || '');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

    const isMounted = useRef(false);

    const debouncedSave = useDebounce((dataToSave) => {
        onSave(dataToSave);
        setSaveStatus('saved');
    }, 1000);

    const variables = useMemo(() => {
        const found = promptText.match(/{{\s*(\w+)\s*}}/g) || [];
        return [...new Set(found.map(v => v.replace(/{{\s*|\s*}}/g, '')))];
    }, [promptText]);

    useEffect(() => {
        // Reset form state when a new prompt is selected
        setName(prompt.name);
        setDescription(prompt.description);
        setPromptText(prompt.promptText);
        setContextVariableName(prompt.contextVariableName || '');
        setSaveStatus('saved');
        isMounted.current = false; // Reset mount status
    }, [prompt]);

    useEffect(() => {
        if (isMounted.current) {
            setSaveStatus('saving');
            debouncedSave({ id: prompt.id, name, description, promptText, contextVariableName: contextVariableName || null });
        } else {
            // This prevents the effect from running on the initial mount
            isMounted.current = true;
        }
    }, [name, description, promptText, contextVariableName, prompt.id, debouncedSave]);
    
     // If the currently selected context variable is no longer in the prompt text, reset it.
    useEffect(() => {
        if (contextVariableName && !variables.includes(contextVariableName)) {
            setContextVariableName('');
        }
    }, [variables, contextVariableName]);


    const getStatusText = () => {
        switch (saveStatus) {
            case 'saved': return `Saved`;
            case 'saving': return 'Saving...';
            case 'unsaved': return 'Unsaved changes';
            default: return '';
        }
    };


    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex overflow-hidden h-full">
            {/* Left Panel: Editor */}
            <div className="w-3/5 flex flex-col p-6 border-r border-gray-700 overflow-y-auto">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Untitled Prompt"
                        className="text-2xl font-bold text-white bg-transparent focus:outline-none w-full border-b-2 border-transparent focus:border-indigo-500 transition-colors py-1"
                    />
                    <div className="flex items-center space-x-4">
                        <p className="text-sm text-gray-400 italic transition-opacity duration-300">
                           {getStatusText()}
                        </p>
                        <button onClick={() => onDelete(prompt.id)} className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10" aria-label="Delete prompt">
                            <TrashIcon />
                        </button>
                    </div>
                </div>

                <div className="mb-6 flex-shrink-0">
                    <label htmlFor="prompt-description" className="text-sm font-medium text-gray-400">Description</label>
                    <textarea
                        id="prompt-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="A brief description of what this prompt does."
                        className="mt-1 w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                    />
                </div>
                
                 <div className="mb-6 flex-shrink-0">
                    <label htmlFor="context-variable" className="text-sm font-medium text-gray-400">Context Variable</label>
                    <p className="text-xs text-gray-500 mb-1">Select which variable receives document content for slash commands.</p>
                     <select
                        id="context-variable"
                        value={contextVariableName}
                        onChange={e => setContextVariableName(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        disabled={variables.length === 0}
                    >
                        <option value="">-- None --</option>
                        {variables.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                
                <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-baseline">
                        <label htmlFor="prompt-text" className="text-sm font-medium text-gray-400">Prompt Text</label>
                        <p className="text-xs text-gray-500 mb-2">Use <code className="bg-gray-700 px-1 py-0.5 rounded">{'{{variable}}'}</code> syntax to define inputs.</p>
                    </div>
                    <textarea
                        id="prompt-text"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Your prompt template here..."
                        className="w-full flex-grow bg-gray-900 border border-gray-600 rounded-md p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none font-mono text-sm leading-relaxed"
                    />
                </div>
            </div>

            {/* Right Panel: Test Console */}
            <div className="w-2/5 flex flex-col overflow-y-auto">
                <TestConsole
                    promptText={promptText}
                    onRunPrompt={onRunPrompt}
                />
            </div>
        </div>
    );
};
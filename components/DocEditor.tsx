import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Doc } from '../types';
import { TrashIcon } from './icons';

interface DocEditorProps {
    doc: Doc;
    onSave: (docId: string, data: { title: string; content: string }) => void;
    onDelete: (docId: string) => void;
}

// Custom hook for debouncing
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
    const timeoutRef = useRef<number | null>(null);

    return (...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

export const DocEditor: React.FC<DocEditorProps> = ({ doc, onSave, onDelete }) => {
    const [title, setTitle] = useState(doc.title);
    const [content, setContent] = useState(doc.content);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

    const debouncedSave = useDebounce((newTitle: string, newContent: string) => {
        onSave(doc.id, { title: newTitle, content: newContent });
        setSaveStatus('saved');
    }, 1500); // 1.5 seconds debounce delay

    useEffect(() => {
        setTitle(doc.title);
        setContent(doc.content);
        setSaveStatus('saved');
    }, [doc]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setSaveStatus('saving');
        debouncedSave(e.target.value, content);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setSaveStatus('saving');
        debouncedSave(title, e.target.value);
    };
    
    const getStatusText = () => {
        switch(saveStatus) {
            case 'saved':
                return `Last saved at ${doc.updatedAt.toLocaleTimeString()}`;
            case 'saving':
                return 'Saving...';
            case 'unsaved':
                return 'Unsaved changes';
            default:
                return '';
        }
    }

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col overflow-hidden p-6 h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Untitled Document"
                    className="text-3xl font-bold text-white bg-transparent focus:outline-none w-full border-b-2 border-transparent focus:border-indigo-500 transition-colors py-2"
                />
                <div className="flex items-center space-x-4">
                     <p className="text-sm text-gray-400 italic transition-opacity duration-300">
                        {getStatusText()}
                    </p>
                    <button onClick={() => onDelete(doc.id)} className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10" aria-label="Delete document">
                        <TrashIcon />
                    </button>
                </div>
            </div>
            <div className="flex-grow relative">
                <textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Start writing your document here..."
                    className="w-full h-full bg-transparent text-gray-200 resize-none focus:outline-none leading-relaxed text-lg absolute inset-0 pr-2"
                />
            </div>
        </div>
    );
};

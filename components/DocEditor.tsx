import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Doc, Prompt } from '../types';
import { TrashIcon, SparklesIcon } from './icons';
// FIX: Add ReactRenderer to correctly render React components in tiptap's suggestion utility.
import { useEditor, EditorContent, Editor, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Mention } from '@tiptap/extension-mention';
import { Node } from '@tiptap/core';
import { SlashCommandMenu } from './SlashCommandMenu';
// FIX: Import tippy to make it available for creating the popup.
import tippy from 'tippy.js';


interface DocEditorProps {
    doc: Doc;
    prompts: Prompt[];
    onSave: (docId: string, data: { title: string; content: any }) => void;
    onDelete: (docId: string) => void;
    onExecutePrompt: (docId: string, promptId: string) => Promise<string>;
}

// Custom hook for debouncing
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
    const timeoutRef = useRef<number | null>(null);

    return (...args: any[]) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => callback(...args), delay);
    };
};

// --- TipTap Customizations ---

// 1. Custom Loading Node
const LoadingNode = Node.create({
    name: 'loadingNode',
    group: 'block',
    atom: true,
    parseHTML() { return [{ tag: 'div[data-type="loading-node"]' }] },
    renderHTML({ HTMLAttributes }) { return ['div', { ...HTMLAttributes, 'data-type': 'loading-node' }] },
    addNodeView() {
        return () => {
            const dom = document.createElement('div');
            dom.className = 'bg-gray-700/50 border border-gray-600 rounded-lg p-4 my-4 text-center text-gray-400 animate-pulse';
            dom.textContent = '🧠 Weaver is thinking...';
            return { dom };
        };
    },
});

// 2. Slash Command Configuration
const CommandPlugin = (prompts: Prompt[], onExecute: (prompt: Prompt, editor: Editor) => void) => Mention.configure({
    HTMLAttributes: { class: 'mention' },
    suggestion: {
        items: ({ query }) => {
            return prompts
                .filter(p => p.name.toLowerCase().startsWith(query.toLowerCase()))
                .slice(0, 5);
        },
        render: () => {
            let component: any;
            let popup: any;
            return {
                // FIX: Replaced incorrect component instantiation with tiptap's ReactRenderer.
                // This resolves the `new` keyword error, prop-types error, and allows for correct rendering.
                onStart: props => {
                    component = new ReactRenderer(SlashCommandMenu, {
                        props,
                        editor: props.editor,
                    });

                    if (!props.clientRect) {
                        return;
                    }
                    
                    // FIX: 'tippy' is now defined via import, and its content is correctly set to the renderer's DOM element.
                    popup = tippy(document.body, {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    });
                },
                onUpdate(props) {
                    component.update(props);

                    if (!props.clientRect) {
                        return;
                    }

                    popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect });
                },
                onKeyDown(props) {
                    if (props.event.key === 'Escape') {
                        popup?.[0]?.hide();
                        return true;
                    }
                    return component.ref?.onKeyDown(props);
                },
                onExit() {
                    popup?.[0]?.destroy();
                    component.destroy();
                },
            };
        },
// FIX: The `props` object from the Mention extension's command is not the full `Prompt` object.
// We must find the full prompt from the list using the ID provided in `props`.
        command: ({ editor, range, props }) => {
            // `props` is the selected prompt item
            const fullPrompt = prompts.find(p => p.id === props.id);
            if (fullPrompt) {
                onExecute(fullPrompt, editor);
            }

            editor
                .chain()
                .focus()
                .deleteRange(range)
                .run();
        },
        char: '/',
        startOfLine: true,
    }
});


export const DocEditor: React.FC<DocEditorProps> = ({ doc, prompts, onSave, onDelete, onExecutePrompt }) => {
    const [title, setTitle] = useState(doc.title);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const [isSummarizing, setIsSummarizing] = useState(false);
    
    const debouncedSave = useDebounce((newTitle: string, newContent: any) => {
        onSave(doc.id, { title: newTitle, content: newContent });
        setSaveStatus('saved');
    }, 1500);

    const handleExecuteSlashCommand = async (prompt: Prompt, editor: Editor) => {
        const { from, to } = editor.state.selection;
        
        // Insert loading node
        editor.chain().insertContentAt({ from, to }, { type: 'loadingNode' }).run();
        const loadingNodePos = from;

        try {
            const result = await onExecutePrompt(doc.id, prompt.id);
            // Replace loading node with result
            editor.commands.deleteRange({ from: loadingNodePos, to: loadingNodePos + 1 });
            editor.chain().insertContentAt(loadingNodePos, result.split('\n').map(p => `<p>${p}</p>`).join('')).run();

        } catch (error) {
            console.error("Error executing prompt:", error);
            // Replace loading node with an error message
             editor.commands.deleteRange({ from: loadingNodePos, to: loadingNodePos + 1 });
             editor.chain().insertContentAt(loadingNodePos, `<p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>`).run();
        }
    };

    const handleSummarize = async () => {
        const summaryPrompt = prompts.find(p => p.name === 'Summarize Text');
        if (!summaryPrompt || !editor) {
            console.error("Summarize Text prompt not found or editor not ready.");
            return;
        }

        setIsSummarizing(true);
        try {
            const summaryText = await onExecutePrompt(doc.id, summaryPrompt.id);
            const summaryHtml = `<blockquote><p>${summaryText}</p></blockquote><p></p>`; // Wrap in blockquote and add space after
            editor.chain().focus().insertContentAt(0, summaryHtml).run();
        } catch (error) {
            console.error("Error generating summary:", error);
            const errorHtml = `<p><strong>Error generating summary:</strong> ${error instanceof Error ? error.message : 'Unknown error'} </p>`;
            editor.chain().focus().insertContentAt(0, errorHtml).run();
        } finally {
            setIsSummarizing(false);
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Start writing, or type / for AI commands...' }),
            LoadingNode,
            CommandPlugin(prompts, handleExecuteSlashCommand),
        ],
        content: doc.content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg focus:outline-none max-w-none text-gray-200 w-full h-full leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            setSaveStatus('saving');
            debouncedSave(title, editor.getJSON());
        },
    });

    useEffect(() => {
        setTitle(doc.title);
// FIX: The `setContent` command API has changed in newer TipTap versions.
// The second argument should be an options object, not a boolean.
        editor?.commands.setContent(doc.content, { emitUpdate: false });
        setSaveStatus('saved');
    }, [doc, editor]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setSaveStatus('saving');
        debouncedSave(e.target.value, editor?.getJSON());
    };
    
    const getStatusText = () => {
        switch(saveStatus) {
            case 'saved': return `Saved`;
            case 'saving': return 'Saving...';
            case 'unsaved': return 'Unsaved changes';
            default: return '';
        }
    }

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col overflow-hidden h-full">
            <div className="p-6 pb-2 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Untitled Document"
                        className="text-3xl font-bold text-white bg-transparent focus:outline-none w-full border-b-2 border-transparent focus:border-indigo-500 transition-colors py-2"
                    />
                     <div className="flex items-center space-x-4 flex-shrink-0 pl-4">
                        <button 
                            onClick={handleSummarize}
                            disabled={isSummarizing}
                            className="flex items-center gap-2 text-sm bg-indigo-600/50 text-indigo-200 px-3 py-2 rounded-md hover:bg-indigo-600/80 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            <SparklesIcon className={`w-4 h-4 ${isSummarizing ? 'animate-pulse' : ''}`} />
                            {isSummarizing ? 'Summarizing...' : 'Summarize'}
                        </button>
                        <p className="text-sm text-gray-400 italic transition-opacity duration-300">
                            {getStatusText()}
                        </p>
                        <button onClick={() => onDelete(doc.id)} className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10" aria-label="Delete document">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto px-6 pb-6">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};
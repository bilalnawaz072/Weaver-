import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Whiteboard, WhiteboardElement, WhiteboardElementType, StickyNoteElement } from '../types';
import { PlusIcon, SparklesIcon } from './icons';

// --- Draggable Sticky Note Component ---
const DraggableStickyNote: React.FC<{
    element: StickyNoteElement;
    onDrag: (id: string, pos: { x: number; y: number }) => void;
    onUpdate: (id: string, text: string) => void;
    isSelected: boolean;
}> = ({ element, onDrag, onUpdate, isSelected }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - element.position.x,
            y: e.clientY - element.position.y,
        };
        e.stopPropagation();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            onDrag(element.id, { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
        }
    }, [isDragging, element.id, onDrag]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            className={`absolute p-4 rounded-lg shadow-lg flex flex-col transition-all duration-150 ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
            style={{ 
                left: element.position.x, 
                top: element.position.y, 
                width: element.dimensions.width, 
                height: element.dimensions.height, 
                backgroundColor: element.color,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
        >
            <textarea
                value={element.text}
                onChange={(e) => onUpdate(element.id, e.target.value)}
                className="w-full h-full bg-transparent text-gray-900 font-medium focus:outline-none resize-none"
                placeholder="Type something..."
            />
        </div>
    );
};


// --- Main Whiteboard View ---
interface WhiteboardViewProps {
    whiteboard: Whiteboard;
    onSave: (whiteboard: Whiteboard) => void;
    onConvertToTasks: (elementIds: string[]) => void;
}

export const WhiteboardView: React.FC<WhiteboardViewProps> = ({ whiteboard, onSave, onConvertToTasks }) => {
    const [title, setTitle] = useState(whiteboard.title);
    const [elements, setElements] = useState<WhiteboardElement[]>(whiteboard.elements);
    const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
    const canvasRef = useRef<HTMLDivElement>(null);

    // Debounced save
    useEffect(() => {
        const handler = setTimeout(() => {
            onSave({ ...whiteboard, title, elements });
        }, 1500);
        return () => clearTimeout(handler);
    }, [title, elements, whiteboard, onSave]);
    
    // Update local state if the whiteboard prop changes from outside
    useEffect(() => {
        setTitle(whiteboard.title);
        setElements(whiteboard.elements);
    }, [whiteboard]);


    const addStickyNote = () => {
        const noteCount = elements.filter(el => el.type === WhiteboardElementType.StickyNote).length;
        
        const notesPerRow = 4;
        const noteWidth = 200;
        const noteHeight = 150;
        const gap = 40;

        const gridX = noteCount % notesPerRow;
        const gridY = Math.floor(noteCount / notesPerRow);

        const newPosition = {
            x: 100 + gridX * (noteWidth + gap),
            y: 100 + gridY * (noteHeight + gap),
        };

        const newNote: StickyNoteElement = {
            id: crypto.randomUUID(),
            type: WhiteboardElementType.StickyNote,
            position: newPosition,
            dimensions: { width: noteWidth, height: noteHeight },
            text: '',
            color: '#FFE4B5' // Moccasin color
        };
        setElements(prev => [...prev, newNote]);
    };

    const handleElementDrag = (id: string, position: { x: number; y: number }) => {
        setElements(els => els.map(el => el.id === id ? { ...el, position } : el));
    };
    
    const handleElementUpdate = (id: string, text: string) => {
        setElements(els => els.map(el => (el.id === id && el.type === WhiteboardElementType.StickyNote) ? { ...el, text } : el));
    };
    
    const handleCanvasClick = (e: React.MouseEvent) => {
        // Deselect if clicking on the canvas itself
        if (e.target === canvasRef.current) {
            setSelectedElementIds(new Set());
        }
    };
    
    const handleElementClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelection = new Set(selectedElementIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedElementIds(newSelection);
    };

    const handleConvertToTasksClick = () => {
        onConvertToTasks(Array.from(selectedElementIds));
        setSelectedElementIds(new Set());
    };
    
    const selectedStickyNotesCount = Array.from(selectedElementIds)
        .filter(id => elements.find(el => el.id === id)?.type === WhiteboardElementType.StickyNote).length;

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col overflow-hidden">
            <header className="p-4 bg-gray-800 flex justify-between items-center flex-shrink-0 border-b border-gray-700">
                 <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold text-white bg-transparent focus:outline-none border-b-2 border-transparent focus:border-indigo-500 transition-colors"
                />
                <div className="flex items-center gap-4">
                    <button onClick={addStickyNote} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors">
                        <PlusIcon /> <span>Add Sticky Note</span>
                    </button>
                    <button 
                        onClick={handleConvertToTasksClick}
                        disabled={selectedStickyNotesCount === 0}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon /> 
                        <span>Convert to Tasks ({selectedStickyNotesCount})</span>
                    </button>
                </div>
            </header>
            <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="flex-grow relative overflow-auto bg-gray-900 bg-grid-gray-700/20"
                style={{ backgroundSize: '20px 20px' }}
            >
                {elements.map(el => {
                    if (el.type === WhiteboardElementType.StickyNote) {
                        return (
                             <div key={el.id} onClick={(e) => handleElementClick(el.id, e)}>
                                <DraggableStickyNote
                                    element={el}
                                    onDrag={handleElementDrag}
                                    onUpdate={handleElementUpdate}
                                    isSelected={selectedElementIds.has(el.id)}
                                />
                             </div>
                        )
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

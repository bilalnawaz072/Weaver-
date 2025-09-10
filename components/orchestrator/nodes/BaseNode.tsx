import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { StepExecutionStatus } from '../../../types';

interface BaseNodeProps {
    title: string;
    type: string;
    color: string;
    position: { x: number; y: number };
    onDrag: (pos: { x: number; y: number }) => void;
    onSelect: () => void;
    isSelected: boolean;
    children: React.ReactNode;
    status?: StepExecutionStatus;
    isReadOnly?: boolean;
}

export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(({ title, type, color, position, onDrag, onSelect, isSelected, children, status, isReadOnly = false }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isReadOnly) {
            onSelect();
            return;
        };
        // Prevent drag from starting on interactive elements like handles
        if ((e.target as HTMLElement).dataset.handle) return;
        
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        e.stopPropagation();
        onSelect();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newPos = {
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            };
            onDrag(newPos);
        }
    }, [isDragging, onDrag]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

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

    const borderClass = (() => {
        if (status === StepExecutionStatus.Succeeded) return 'border-green-500 ring-2 ring-green-600/50';
        if (status === StepExecutionStatus.Failed) return 'border-red-500 ring-2 ring-red-600/50';
        if (isSelected) return 'border-indigo-400 ring-2 ring-indigo-500';
        return 'border-gray-600';
    })();

    return (
        <div
            ref={ref}
            className={`absolute bg-gray-800 rounded-lg shadow-xl border-2 transition-all duration-150 ${borderClass}`}
            style={{ left: position.x, top: position.y, cursor: isReadOnly ? 'pointer' : (isDragging ? 'grabbing' : 'grab') }}
            onMouseDown={handleMouseDown}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
            <div className={`p-2 rounded-t-md font-bold text-sm ${color}`}>
                {title}
            </div>
            <div className="p-4 text-sm relative">
                {children}
            </div>
        </div>
    );
});
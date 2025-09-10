import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Prompt } from '../types';
import { BeakerIcon } from './icons';

interface SlashCommandMenuProps {
    items: Prompt[];
    command: (item: Prompt) => void;
}

export const SlashCommandMenu = forwardRef((props: SlashCommandMenuProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: React.KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-white w-80 overflow-hidden">
            <div className="p-2">
                {props.items.length ? (
                    props.items.map((item, index) => (
                        <button
                            className={`w-full text-left flex items-start space-x-3 p-2 rounded-md transition-colors ${
                                index === selectedIndex ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                            }`}
                            key={item.id}
                            onClick={() => selectItem(index)}
                        >
                            <BeakerIcon className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                            <div>
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-xs text-gray-400">{item.description}</div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center p-4 text-sm text-gray-400">No matching commands</div>
                )}
            </div>
        </div>
    );
});
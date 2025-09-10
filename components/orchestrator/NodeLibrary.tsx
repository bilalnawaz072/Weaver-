import React from 'react';
import { NodeType } from '../../types';

const libraryItems = [
    { type: NodeType.TriggerSchedule, name: 'Schedule', description: 'Starts workflow on a timer.', category: 'Triggers' },
    { type: NodeType.LogicIf, name: 'If/Then', description: 'Branch based on a condition.', category: 'Logic' },
];

const DraggableNode: React.FC<{ item: typeof libraryItems[0] }> = ({ item }) => {
    const onDragStart = (e: React.DragEvent, nodeType: NodeType) => {
        e.dataTransfer.setData('application/weaver-node', nodeType);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className="p-3 bg-gray-800 rounded-md border border-gray-700 cursor-grab active:cursor-grabbing hover:bg-gray-700/50 hover:border-indigo-500 transition-colors"
        >
            <h4 className="font-bold text-white">{item.name}</h4>
            <p className="text-xs text-gray-400">{item.description}</p>
        </div>
    );
};

export const NodeLibrary: React.FC = () => {
    const groupedItems = libraryItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof libraryItems>);

    return (
        <aside className="w-64 bg-gray-800/50 p-4 border-r border-gray-700 flex-shrink-0">
            <h3 className="text-xl font-bold text-white mb-4">Nodes</h3>
            <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">{category}</h4>
                        <div className="space-y-3">
                            {items.map(item => <DraggableNode key={item.type} item={item} />)}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

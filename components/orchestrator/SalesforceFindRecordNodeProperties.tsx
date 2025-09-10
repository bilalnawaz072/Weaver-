import React from 'react';
import { Node, SalesforceFindRecordNodeData } from '../../types';

interface SalesforceFindRecordNodePropertiesProps {
    node: Node<SalesforceFindRecordNodeData>;
    onUpdate: (data: Partial<SalesforceFindRecordNodeData>) => void;
}

export const SalesforceFindRecordNodeProperties: React.FC<SalesforceFindRecordNodePropertiesProps> = ({ node, onUpdate }) => {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-300 mb-1">Label</label>
                <input
                    id="label"
                    type="text"
                    value={node.data.label}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
            <div>
                <label htmlFor="objectType" className="block text-sm font-medium text-gray-300 mb-1">Object Type</label>
                <input
                    id="objectType"
                    type="text"
                    value={node.data.objectType}
                    onChange={(e) => onUpdate({ objectType: e.target.value })}
                    placeholder="e.g., Contact or Account"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
            <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-300 mb-1">Query (WHERE clause)</label>
                <textarea
                    id="query"
                    value={node.data.query}
                    onChange={(e) => onUpdate({ query: e.target.value })}
                    rows={4}
                    placeholder="e.g., Email = 'test@example.com'"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white font-mono text-sm"
                />
            </div>
        </div>
    );
};

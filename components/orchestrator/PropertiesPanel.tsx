import React from 'react';
import { Node, NodeType, NodeData, ScheduleNodeData, ConditionNodeData, Prompt, PromptNodeData } from '../../types';
import { PromptNodeProperties } from './PromptNodeProperties';


interface PropertiesPanelProps {
    selectedNode: Node | undefined;
    prompts: Prompt[];
    onUpdateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
}

const ScheduleNodeProperties: React.FC<{ node: Node<ScheduleNodeData>, onUpdate: (data: Partial<ScheduleNodeData>) => void }> = ({ node, onUpdate }) => {
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
                <label htmlFor="interval" className="block text-sm font-medium text-gray-300 mb-1">Interval</label>
                <select
                    id="interval"
                    value={node.data.interval}
                    onChange={(e) => onUpdate({ interval: e.target.value as ScheduleNodeData['interval'] })}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                >
                    <option value="hour">Hourly</option>
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                </select>
            </div>
            <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                <input
                    id="time"
                    type="time"
                    value={node.data.time}
                    onChange={(e) => onUpdate({ time: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
        </div>
    );
};

const ConditionNodeProperties: React.FC<{ node: Node<ConditionNodeData>, onUpdate: (data: Partial<ConditionNodeData>) => void }> = ({ node, onUpdate }) => {
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
            <p className="text-sm text-gray-400">If...</p>
            <div>
                <label htmlFor="variable" className="block text-sm font-medium text-gray-300 mb-1">Variable</label>
                <input
                    id="variable"
                    type="text"
                    value={node.data.variable}
                    onChange={(e) => onUpdate({ variable: e.target.value })}
                    placeholder="e.g. input.data"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
            <div>
                <label htmlFor="operator" className="block text-sm font-medium text-gray-300 mb-1">Operator</label>
                <select
                    id="operator"
                    value={node.data.operator}
                    onChange={(e) => onUpdate({ operator: e.target.value as ConditionNodeData['operator'] })}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="gt">Greater Than</option>
                    <option value="lt">Less Than</option>
                </select>
            </div>
             <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-1">Value</label>
                <input
                    id="value"
                    type="text"
                    value={node.data.value}
                    onChange={(e) => onUpdate({ value: e.target.value })}
                    placeholder="Value to compare against"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
        </div>
    );
};


export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, prompts, onUpdateNodeData }) => {
    const renderProperties = () => {
        if (!selectedNode) return null;

        const handleUpdate = (data: Partial<NodeData>) => {
            onUpdateNodeData(selectedNode.id, data);
        }

        switch (selectedNode.type) {
            case NodeType.TriggerSchedule:
                return <ScheduleNodeProperties node={selectedNode as Node<ScheduleNodeData>} onUpdate={handleUpdate} />;
            case NodeType.LogicIf:
                return <ConditionNodeProperties node={selectedNode as Node<ConditionNodeData>} onUpdate={handleUpdate} />;
            case NodeType.ActionPrompt:
                return <PromptNodeProperties node={selectedNode as Node<PromptNodeData>} prompts={prompts} onUpdate={handleUpdate} />;
            default:
                return <p>Unknown node type selected.</p>;
        }
    };

    return (
        <aside className="w-80 bg-gray-800/50 p-4 border-l border-gray-700 flex-shrink-0 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Properties</h3>
            {selectedNode ? (
                <div>
                    {renderProperties()}
                </div>
            ) : (
                <div className="text-center text-gray-400 pt-10">
                    <p>Select a node to view its properties.</p>
                </div>
            )}
        </aside>
    );
};
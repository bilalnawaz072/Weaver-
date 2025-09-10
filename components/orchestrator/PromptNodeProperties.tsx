import React, { useMemo } from 'react';
import { Node, Prompt, PromptNodeData } from '../../types';

interface PromptNodePropertiesProps {
    node: Node<PromptNodeData>;
    prompts: Prompt[];
    onUpdate: (data: Partial<PromptNodeData>) => void;
}

export const PromptNodeProperties: React.FC<PromptNodePropertiesProps> = ({ node, prompts, onUpdate }) => {
    const selectedPrompt = useMemo(() => {
        return prompts.find(p => p.id === node.data.promptId);
    }, [prompts, node.data.promptId]);

    const variables = useMemo(() => {
        if (!selectedPrompt) return [];
        const found = selectedPrompt.promptText.match(/{{\s*(\w+)\s*}}/g) || [];
        return [...new Set(found.map(v => v.replace(/{{\s*|\s*}}/g, '')))];
    }, [selectedPrompt]);

    const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const promptId = e.target.value;
        const prompt = prompts.find(p => p.id === promptId);
        onUpdate({
            promptId,
            label: prompt ? prompt.name : 'Prompt',
            variableMappings: {}, // Reset mappings when prompt changes
        });
    };

    const handleMappingChange = (variable: string, value: string) => {
        const newMappings = {
            ...node.data.variableMappings,
            [variable]: value,
        };
        onUpdate({ variableMappings: newMappings });
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="prompt-select" className="block text-sm font-medium text-gray-300 mb-1">Select Prompt</label>
                <select
                    id="prompt-select"
                    value={node.data.promptId || ''}
                    onChange={handlePromptChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                >
                    <option value="">-- Select a prompt --</option>
                    {prompts.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {selectedPrompt && variables.length > 0 && (
                <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
                    <h4 className="text-md font-semibold text-white">Variable Mapping</h4>
                    <p className="text-xs text-gray-400">
                        Set static values or map from previous nodes using <code className="bg-gray-700 p-1 rounded">{`{{node-id.output}}`}</code> syntax.
                    </p>
                    {variables.map(variable => (
                        <div key={variable}>
                            <label htmlFor={`var-${variable}`} className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                                {variable.replace(/_/g, ' ')}
                            </label>
                            <input
                                id={`var-${variable}`}
                                type="text"
                                value={node.data.variableMappings[variable] || ''}
                                onChange={(e) => handleMappingChange(variable, e.target.value)}
                                placeholder="Enter a value or mapping"
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
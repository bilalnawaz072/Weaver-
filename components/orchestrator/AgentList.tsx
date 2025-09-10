import React from 'react';
import { Workflow } from '../../types';
import { PlusIcon, CpuChipIcon } from '../icons';

interface AgentListProps {
    workflows: Workflow[];
    onSelectWorkflow: (id: string) => void;
    onCreateWorkflow: () => void;
}

export const AgentList: React.FC<AgentListProps> = ({ workflows, onSelectWorkflow, onCreateWorkflow }) => {
    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Agents</h2>
                <button
                    onClick={onCreateWorkflow}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                    <PlusIcon />
                    <span>New Agent</span>
                </button>
            </div>

            {workflows.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-center text-gray-400">
                    <div>
                        <CpuChipIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-lg font-semibold text-white">No Agents Yet</h3>
                        <p className="mt-1 text-sm">Create your first agent to automate your workflows.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workflows.map(workflow => (
                        <div
                            key={workflow.id}
                            onClick={() => onSelectWorkflow(workflow.id)}
                            className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 cursor-pointer transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-white mb-2">{workflow.name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${workflow.isActive ? 'bg-green-600 text-green-100' : 'bg-gray-600 text-gray-200'}`}>
                                    {workflow.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Contains {workflow.definition.nodes.length} step(s).
                            </p>
                            <p className="text-xs text-gray-500">
                                Last updated: {workflow.updatedAt.toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

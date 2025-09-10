import React from 'react';
import { Node, CreateTaskNodeData, Project } from '../../types';

interface CreateTaskNodePropertiesProps {
    node: Node<CreateTaskNodeData>;
    projects: Project[];
    onUpdate: (data: Partial<CreateTaskNodeData>) => void;
}

export const CreateTaskNodeProperties: React.FC<CreateTaskNodePropertiesProps> = ({ node, projects, onUpdate }) => {
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
                <label htmlFor="project-select" className="block text-sm font-medium text-gray-300 mb-1">Project</label>
                <select
                    id="project-select"
                    value={node.data.projectId || ''}
                    onChange={(e) => onUpdate({ projectId: e.target.value || null })}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                >
                    <option value="">-- Select a project --</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Task Title</label>
                <input
                    id="title"
                    type="text"
                    value={node.data.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="e.g., Follow up on lead"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Task Description</label>
                <textarea
                    id="description"
                    value={node.data.description}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    rows={4}
                    placeholder="Add more details..."
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
        </div>
    );
};

import React from 'react';
import { Node, GitHubCreateIssueNodeData } from '../../types';

interface GitHubCreateIssueNodePropertiesProps {
    node: Node<GitHubCreateIssueNodeData>;
    onUpdate: (data: Partial<GitHubCreateIssueNodeData>) => void;
}

export const GitHubCreateIssueNodeProperties: React.FC<GitHubCreateIssueNodePropertiesProps> = ({ node, onUpdate }) => {
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
                <label htmlFor="repository" className="block text-sm font-medium text-gray-300 mb-1">Repository</label>
                <input
                    id="repository"
                    type="text"
                    value={node.data.repository}
                    onChange={(e) => onUpdate({ repository: e.target.value })}
                    placeholder="owner/repo-name"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Issue Title</label>
                <input
                    id="title"
                    type="text"
                    value={node.data.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="e.g., Fix login button"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
            </div>
            <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-300 mb-1">Body</label>
                <textarea
                    id="body"
                    value={node.data.body}
                    onChange={(e) => onUpdate({ body: e.target.value })}
                    rows={5}
                    placeholder="Describe the issue. Supports markdown."
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white font-mono text-sm"
                />
            </div>
        </div>
    );
};

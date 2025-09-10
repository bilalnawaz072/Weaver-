import React from 'react';
import { Node, HttpRequestNodeData } from '../../types';

interface HttpRequestNodePropertiesProps {
    node: Node<HttpRequestNodeData>;
    onUpdate: (data: Partial<HttpRequestNodeData>) => void;
}

export const HttpRequestNodeProperties: React.FC<HttpRequestNodePropertiesProps> = ({ node, onUpdate }) => {
    // A simplified way to handle JSON-like string for headers
    const handleHeadersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        try {
            // Allow empty string to clear headers
            if (e.target.value.trim() === '') {
                 onUpdate({ headers: {} });
                 return;
            }
            const parsed = JSON.parse(e.target.value);
            onUpdate({ headers: parsed });
        } catch (error) {
            // Can add visual error feedback later
            console.warn("Invalid JSON for headers");
        }
    };
    
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
            <div className="flex gap-2">
                <div className="w-1/3">
                    <label htmlFor="method" className="block text-sm font-medium text-gray-300 mb-1">Method</label>
                    <select
                        id="method"
                        value={node.data.method}
                        onChange={(e) => onUpdate({ method: e.target.value as HttpRequestNodeData['method'] })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                    >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                        <option>PATCH</option>
                    </select>
                </div>
                <div className="w-2/3">
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                    <input
                        id="url"
                        type="text"
                        value={node.data.url}
                        onChange={(e) => onUpdate({ url: e.target.value })}
                        placeholder="https://api.example.com"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="headers" className="block text-sm font-medium text-gray-300 mb-1">Headers (JSON)</label>
                <textarea
                    id="headers"
                    defaultValue={JSON.stringify(node.data.headers, null, 2)}
                    onBlur={handleHeadersChange}
                    rows={4}
                    placeholder={`{\n  "Content-Type": "application/json"\n}`}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white font-mono text-xs"
                />
            </div>
            <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-300 mb-1">Body</label>
                <textarea
                    id="body"
                    value={node.data.body}
                    onChange={(e) => onUpdate({ body: e.target.value })}
                    rows={6}
                    placeholder="Enter raw body content or JSON..."
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white font-mono text-xs"
                />
            </div>
        </div>
    );
};

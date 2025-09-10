import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Project } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface Node {
    id: string;
    position: { x: number; y: number };
    data: { label: string };
}

interface Edge {
    id: string;
    source: string;
    target: string;
}

interface MindMapViewProps {
    project: Project;
    onSave: (projectId: string, data: any) => void;
    onConvertToTasks: (projectId: string, data: any) => void;
}

export const MindMapView: React.FC<MindMapViewProps> = ({ project, onSave, onConvertToTasks }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (project.mindMapData && project.mindMapData.nodes && project.mindMapData.nodes.length > 0) {
            setNodes(project.mindMapData.nodes);
            setEdges(project.mindMapData.edges || []);
        } else {
            // Initialize with a central node if empty
            const centralNode: Node = {
                id: crypto.randomUUID(),
                position: { x: 400, y: 300 },
                data: { label: project.name },
            };
            setNodes([centralNode]);
            setEdges([]);
        }
        // Ensure we don't auto-save on the initial load from props
        isInitialMount.current = true;
    }, [project]);

    // Debounced auto-save
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const handler = setTimeout(() => {
            onSave(project.id, { nodes, edges });
        }, 1500);
        return () => clearTimeout(handler);
    }, [nodes, edges, project.id, onSave]);


    const addNode = (parentNodeId?: string) => {
        const parentNode = nodes.find(n => n.id === parentNodeId);
        let position: { x: number; y: number };

        if (parentNode) {
            // Position child nodes relative to the parent, attempting to avoid overlap
            const childEdges = edges.filter(e => e.source === parentNodeId);
            position = {
                x: parentNode.position.x + 220,
                y: parentNode.position.y + (childEdges.length * 70) - (childEdges.length > 0 ? 35 : 0),
            };
        } else {
            // Position new root nodes in a grid to avoid overlap
            const rootNodes = nodes.filter(n => !edges.some(e => e.target === n.id));
            position = {
                x: 100 + ((rootNodes.length -1) % 4) * 220,
                y: 100 + Math.floor((rootNodes.length-1) / 4) * 120,
            };
        }

        const newNode: Node = {
            id: crypto.randomUUID(),
            position,
            data: { label: 'New Idea' },
        };
        setNodes(prev => [...prev, newNode]);

        if (parentNodeId) {
            const newEdge: Edge = {
                id: `e-${parentNodeId}-${newNode.id}`,
                source: parentNodeId,
                target: newNode.id,
            };
            setEdges(prev => [...prev, newEdge]);
        }
    };

    const deleteNode = (nodeId: string) => {
        setNodes(nodes => nodes.filter(n => n.id !== nodeId));
        setEdges(edges => edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    };

    const updateNodeLabel = (nodeId: string, label: string) => {
        setNodes(nodes => nodes.map(n => n.id === nodeId ? { ...n, data: { ...n, label } } : n));
    };

    const onNodeDrag = (id: string, newPosition: { x: number, y: number }) => {
        setNodes(nodes => nodes.map(n => n.id === id ? { ...n, position: newPosition } : n));
    };

    const startConnection = (nodeId: string) => {
        setIsConnecting(nodeId);
    };

    const finishConnection = (targetNodeId: string) => {
        if (isConnecting && isConnecting !== targetNodeId) {
            const newEdge: Edge = {
                id: `e-${isConnecting}-${targetNodeId}`,
                source: isConnecting,
                target: targetNodeId,
            };
            // Avoid duplicate edges
            if (!edges.some(e => e.source === newEdge.source && e.target === newEdge.target)) {
                setEdges(prev => [...prev, newEdge]);
            }
        }
        setIsConnecting(null);
    };

    const handleConvertToTasksClick = () => {
        onConvertToTasks(project.id, { nodes, edges });
    };

    const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col overflow-hidden">
            <div className="p-4 bg-gray-800 flex justify-between items-center flex-shrink-0 border-b border-gray-700">
                <h3 className="font-bold text-lg text-white">Mind Map</h3>
                <div className="flex items-center gap-4">
                    <button onClick={() => addNode()} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors">
                        <PlusIcon /> <span>Add Node</span>
                    </button>
                    <button onClick={handleConvertToTasksClick} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">Convert to Tasks</button>
                </div>
            </div>
            <div
                ref={canvasRef}
                className="flex-grow relative overflow-auto bg-gray-900 bg-grid-gray-700/20"
                onClick={() => setContextMenu(null)}
                style={{ backgroundSize: '20px 20px' }}
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {edges.map(edge => {
                        const sourceNode = nodeMap.get(edge.source);
                        const targetNode = nodeMap.get(edge.target);
                        if (!sourceNode || !targetNode) return null;
                        return (
                            <line
                                key={edge.id}
                                x1={sourceNode.position.x + 90} // center of node
                                y1={sourceNode.position.y + 25} // center of node
                                x2={targetNode.position.x + 90} // center of node
                                y2={targetNode.position.y + 25} // center of node
                                stroke={isConnecting ? "#a78bfa" : "#6b7280"}
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>

                {nodes.map(node => (
                    <DraggableNode
                        key={node.id}
                        node={node}
                        onDrag={onNodeDrag}
                        onUpdateLabel={updateNodeLabel}
                        onStartConnection={startConnection}
                        onFinishConnection={finishConnection}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id }); }}
                    />
                ))}

                {contextMenu && (
                    <div
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-30 text-sm"
                    >
                        <button onClick={() => { addNode(contextMenu.nodeId); setContextMenu(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-700">Add Child Node</button>
                        <button onClick={() => { deleteNode(contextMenu.nodeId); setContextMenu(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400">Delete Node</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const DraggableNode: React.FC<{
    node: Node;
    onDrag: (id: string, pos: { x: number; y: number }) => void;
    onUpdateLabel: (id: string, label: string) => void;
    onStartConnection: (id: string) => void;
    onFinishConnection: (id: string) => void;
    onContextMenu: (e: React.MouseEvent) => void;
}> = ({ node, onDrag, onUpdateLabel, onStartConnection, onFinishConnection, onContextMenu }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
        if ((e.target as HTMLElement).dataset.handle === 'true') return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - node.position.x,
            y: e.clientY - node.position.y,
        };
        e.stopPropagation();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newPos = {
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            };
            onDrag(node.id, newPos);
        }
    }, [isDragging, node.id, onDrag]);

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

    return (
        <div
            className="absolute bg-gray-700 p-3 rounded-lg shadow-lg border-2 border-gray-600 group hover:border-indigo-500"
            style={{ left: node.position.x, top: node.position.y, cursor: isDragging ? 'grabbing' : 'grab', width: 180, height: 50 }}
            onMouseDown={handleMouseDown}
            onMouseUp={() => onFinishConnection(node.id)}
            onContextMenu={onContextMenu}
        >
            <input
                type="text"
                value={node.data.label}
                onChange={(e) => onUpdateLabel(node.id, e.target.value)}
                className="w-full bg-transparent text-white font-semibold focus:outline-none focus:bg-gray-600 rounded p-1"
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
            />
            <div
                data-handle="true"
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity border-2 border-gray-900"
                onMouseDown={(e) => { e.stopPropagation(); onStartConnection(node.id); }}
            />
        </div>
    );
};

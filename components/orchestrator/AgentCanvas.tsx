import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Workflow, WorkflowDefinition, Node, Edge, NodeType, NodeData, ScheduleNodeData, ConditionNodeData, Prompt, PromptNodeData } from '../../types';
import { NodeLibrary } from './NodeLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { ChevronLeftIcon } from '../icons';
import { ScheduleNode } from './nodes/ScheduleNode';
import { ConditionNode } from './nodes/ConditionNode';
import { PromptNode } from './nodes/PromptNode';

interface AgentCanvasProps {
    workflow: Workflow;
    prompts: Prompt[];
    onSave: (workflowId: string, name: string, definition: WorkflowDefinition) => void;
    onBack: () => void;
}

export const AgentCanvas: React.FC<AgentCanvasProps> = ({ workflow, prompts, onSave, onBack }) => {
    const [name, setName] = useState(workflow.name);
    const [nodes, setNodes] = useState<Node[]>(workflow.definition.nodes);
    const [edges, setEdges] = useState<Edge[]>(workflow.definition.edges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [connecting, setConnecting] = useState<{ sourceId: string; sourceHandle: string | null; x: number, y: number } | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<{[key: string]: HTMLDivElement}>({});

    const handleSave = () => {
        onSave(workflow.id, name, { nodes, edges });
    };

    const handleNodeDrag = (id: string, newPosition: { x: number, y: number }) => {
        setNodes(nodes => nodes.map(n => n.id === id ? { ...n, position: newPosition } : n));
    };

    const handleNodeDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/weaver-node') as NodeType;
        if (!type || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
            x: e.clientX - rect.left - 100, // Adjust for node width
            y: e.clientY - rect.top - 50,  // Adjust for node height
        };

        let newNodeData: NodeData;
        switch (type) {
            case NodeType.TriggerSchedule:
                newNodeData = { label: 'Schedule', interval: 'day', time: '09:00' } as ScheduleNodeData;
                break;
            case NodeType.LogicIf:
                newNodeData = { label: 'If Condition', variable: '', operator: 'equals', value: '' } as ConditionNodeData;
                break;
            case NodeType.ActionPrompt:
                newNodeData = { label: 'Prompt', promptId: null, variableMappings: {} } as PromptNodeData;
                break;
            default:
                return;
        }

        const newNode: Node = { id: crypto.randomUUID(), type, position, data: newNodeData };
        setNodes(nodes => [...nodes, newNode]);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleStartConnection = (sourceId: string, sourceHandle: string | null, e: React.MouseEvent) => {
        e.stopPropagation();
        setConnecting({ sourceId, sourceHandle, x: e.clientX, y: e.clientY });
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        if (connecting && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setConnecting(c => c ? { ...c, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
        }
    };
    
    const handleMouseUp = () => {
        if(connecting) {
            setConnecting(null);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [connecting]);

    const handleFinishConnection = (targetId: string, targetHandle: string | null) => {
        if (connecting && connecting.sourceId !== targetId) {
            const newEdge: Edge = {
                id: `e-${connecting.sourceId}-${targetId}`,
                source: connecting.sourceId,
                sourceHandle: connecting.sourceHandle,
                target: targetId,
                targetHandle: targetHandle,
            };
            if (!edges.some(e => e.source === newEdge.source && e.target === newEdge.target && e.sourceHandle === newEdge.sourceHandle)) {
                setEdges(prev => [...prev, newEdge]);
            }
        }
        setConnecting(null);
    };
    
    const updateNodeData = (nodeId: string, newData: Partial<NodeData>) => {
        setNodes(nodes => nodes.map(n => 
            n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
        ));
    };

    const getHandlePosition = (nodeId: string, handleId: string | null, type: 'source' | 'target'): { x: number, y: number } | null => {
        const node = nodes.find(n => n.id === nodeId);
        const nodeElement = nodeRefs.current[nodeId];
        if (!node || !nodeElement || !canvasRef.current) return null;
    
        const nodeRect = nodeElement.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();

        const localX = nodeRect.left - canvasRect.left;
        const localY = nodeRect.top - canvasRect.top;
    
        if (node.type === NodeType.LogicIf && type === 'source' && handleId) {
            // Specific positions for 'true' and 'false' handles on ConditionNode
            const handleY = handleId === 'true' ? nodeRect.height * 0.35 : nodeRect.height * 0.65;
            return { x: localX + nodeRect.width, y: localY + handleY };
        }
    
        // Default positions
        if (type === 'source') {
            return { x: localX + nodeRect.width, y: localY + nodeRect.height / 2 };
        } else {
            return { x: localX, y: localY + nodeRect.height / 2 };
        }
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className="flex-grow flex h-full overflow-hidden">
            <NodeLibrary />
            <div className="flex-grow flex flex-col">
                <header className="p-4 bg-gray-800 flex justify-between items-center flex-shrink-0 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-md hover:bg-gray-700">
                            <ChevronLeftIcon />
                        </button>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-xl font-bold text-white bg-transparent focus:outline-none border-b-2 border-transparent focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
                        Save Agent
                    </button>
                </header>

                <div
                    ref={canvasRef}
                    className="flex-grow relative overflow-auto bg-gray-900 bg-grid-gray-700/20"
                    onDrop={handleNodeDrop}
                    onDragOver={handleDragOver}
                    onClick={() => setSelectedNodeId(null)}
                >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {edges.map(edge => {
                            const sourcePos = getHandlePosition(edge.source, edge.sourceHandle, 'source');
                            const targetPos = getHandlePosition(edge.target, edge.targetHandle, 'target');
                            if (!sourcePos || !targetPos) return null;
                            const path = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${targetPos.x - 50} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;
                            return <path key={edge.id} d={path} stroke="#6b7280" strokeWidth="2" fill="none" />;
                        })}
                        {connecting && canvasRef.current && (() => {
                            const sourcePos = getHandlePosition(connecting.sourceId, connecting.sourceHandle, 'source');
                            if (!sourcePos) return null;
                            const path = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${connecting.x - 50} ${connecting.y}, ${connecting.x} ${connecting.y}`;
                            return <path d={path} stroke="#a78bfa" strokeWidth="2" fill="none" strokeDasharray="5,5" />;
                        })()}
                    </svg>

                    {/* FIX: Use a switch statement to render the correct node component for each node type. This resolves a TypeScript error by ensuring the `node` prop is correctly typed for the component being rendered. A type assertion is needed because the `Node<T>` type definition prevents automatic type narrowing. */}
                    {nodes.map(node => {
                        switch (node.type) {
                            case NodeType.TriggerSchedule:
                                return (
                                    <ScheduleNode
                                        key={node.id}
                                        ref={(el: HTMLDivElement) => { if(el) nodeRefs.current[node.id] = el }}
                                        node={node as Node<ScheduleNodeData>}
                                        onDrag={handleNodeDrag}
                                        onSelect={() => setSelectedNodeId(node.id)}
                                        isSelected={selectedNodeId === node.id}
                                        onStartConnection={handleStartConnection}
                                        onFinishConnection={handleFinishConnection}
                                    />
                                );
                            case NodeType.LogicIf:
                                return (
                                    <ConditionNode
                                        key={node.id}
                                        ref={(el: HTMLDivElement) => { if(el) nodeRefs.current[node.id] = el }}
                                        node={node as Node<ConditionNodeData>}
                                        onDrag={handleNodeDrag}
                                        onSelect={() => setSelectedNodeId(node.id)}
                                        isSelected={selectedNodeId === node.id}
                                        onStartConnection={handleStartConnection}
                                        onFinishConnection={handleFinishConnection}
                                    />
                                );
                            case NodeType.ActionPrompt:
                                return (
                                    <PromptNode
                                        key={node.id}
                                        ref={(el: HTMLDivElement) => { if(el) nodeRefs.current[node.id] = el }}
                                        node={node as Node<PromptNodeData>}
                                        onDrag={handleNodeDrag}
                                        onSelect={() => setSelectedNodeId(node.id)}
                                        isSelected={selectedNodeId === node.id}
                                        onStartConnection={handleStartConnection}
                                        onFinishConnection={handleFinishConnection}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            </div>
            <PropertiesPanel 
                selectedNode={selectedNode}
                onUpdateNodeData={updateNodeData}
                prompts={prompts}
            />
        </div>
    );
};
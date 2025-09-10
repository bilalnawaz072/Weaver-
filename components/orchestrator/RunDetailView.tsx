import React, { useState, useRef, useMemo } from 'react';
import { Workflow, Node as WorkflowNode, Edge, NodeType, ScheduleNodeData, ConditionNodeData, PromptNodeData, WorkflowRun, StepExecution } from '../../types';
import { ChevronLeftIcon } from '../icons';
import { ScheduleNode } from './nodes/ScheduleNode';
import { ConditionNode } from './nodes/ConditionNode';
import { PromptNode } from './nodes/PromptNode';
import { RunStatusBadge } from './RunStatusBadge';
import { StepInspectorPanel } from './StepInspectorPanel';

interface RunDetailViewProps {
    run: WorkflowRun;
    workflow: Workflow;
    stepExecutions: StepExecution[];
    onBack: () => void;
}

export const RunDetailView: React.FC<RunDetailViewProps> = ({ run, workflow, stepExecutions, onBack }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<{ [key: string]: HTMLDivElement }>({});

    const stepExecutionMap = useMemo(() =>
        new Map(stepExecutions.map(s => [s.nodeId, s])),
        [stepExecutions]
    );

    const getHandlePosition = (nodeId: string, handleId: string | null, type: 'source' | 'target'): { x: number, y: number } | null => {
        const node = workflow.definition.nodes.find(n => n.id === nodeId);
        const nodeElement = nodeRefs.current[nodeId];
        if (!node || !nodeElement || !canvasRef.current) return null;

        const nodeRect = nodeElement.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();

        const localX = nodeRect.left - canvasRect.left;
        const localY = nodeRect.top - canvasRect.top;

        if (node.type === NodeType.LogicIf && type === 'source' && handleId) {
            const handleY = handleId === 'true' ? nodeRect.height * 0.35 : nodeRect.height * 0.65;
            return { x: localX + nodeRect.width, y: localY + handleY };
        }

        if (type === 'source') {
            return { x: localX + nodeRect.width, y: localY + nodeRect.height / 2 };
        } else {
            return { x: localX, y: localY + nodeRect.height / 2 };
        }
    };

    const selectedStep = selectedNodeId ? stepExecutionMap.get(selectedNodeId) : undefined;
    
    return (
        <div className="flex-grow flex h-full overflow-hidden">
            <div className="flex-grow flex flex-col">
                <header className="p-4 bg-gray-800 flex justify-between items-center flex-shrink-0 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-md hover:bg-gray-700">
                            <ChevronLeftIcon />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-white">{workflow.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>Run: {run.id}</span>
                                <RunStatusBadge status={run.status} />
                            </div>
                        </div>
                    </div>
                </header>
                 <div
                    ref={canvasRef}
                    className="flex-grow relative overflow-auto bg-gray-900 bg-grid-gray-700/20"
                    onClick={() => setSelectedNodeId(null)}
                >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {workflow.definition.edges.map(edge => {
                            const sourcePos = getHandlePosition(edge.source, edge.sourceHandle, 'source');
                            const targetPos = getHandlePosition(edge.target, edge.targetHandle, 'target');
                            if (!sourcePos || !targetPos) return null;
                            const path = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${targetPos.x - 50} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;
                            return <path key={edge.id} d={path} stroke="#6b7280" strokeWidth="2" fill="none" />;
                        })}
                    </svg>
                    {workflow.definition.nodes.map(node => {
                         const execution = stepExecutionMap.get(node.id);
                         switch (node.type) {
                            case NodeType.TriggerSchedule:
                                return (
                                    <ScheduleNode
                                        key={node.id}
                                        ref={(el: HTMLDivElement) => { if(el) nodeRefs.current[node.id] = el }}
                                        node={node as WorkflowNode<ScheduleNodeData>}
                                        onDrag={() => {}}
                                        onSelect={() => setSelectedNodeId(node.id)}
                                        isSelected={selectedNodeId === node.id}
                                        onStartConnection={() => {}}
                                        onFinishConnection={() => {}}
                                        isReadOnly={true}
                                        status={execution?.status}
                                    />
                                );
                            case NodeType.LogicIf:
                                return (
                                    <ConditionNode
                                        key={node.id}
                                        ref={(el: HTMLDivElement) => { if(el) nodeRefs.current[node.id] = el }}
                                        node={node as WorkflowNode<ConditionNodeData>}
                                        onDrag={() => {}}
                                        onSelect={() => setSelectedNodeId(node.id)}
                                        isSelected={selectedNodeId === node.id}
                                        onStartConnection={() => {}}
                                        onFinishConnection={() => {}}
                                        isReadOnly={true}
                                        status={execution?.status}
                                    />
                                );
                            case NodeType.ActionPrompt:
                                return (
                                    <PromptNode
                                        key={node.id}
                                        ref={(el: HTMLDivElement) => { if(el) nodeRefs.current[node.id] = el }}
                                        node={node as WorkflowNode<PromptNodeData>}
                                        onDrag={() => {}}
                                        onSelect={() => setSelectedNodeId(node.id)}
                                        isSelected={selectedNodeId === node.id}
                                        onStartConnection={() => {}}
                                        onFinishConnection={() => {}}
                                        isReadOnly={true}
                                        status={execution?.status}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            </div>
            <StepInspectorPanel selectedStep={selectedStep} />
        </div>
    );
};

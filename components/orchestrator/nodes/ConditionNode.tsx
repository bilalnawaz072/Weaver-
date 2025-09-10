import React, { forwardRef } from 'react';
import { Node as NodeType, ConditionNodeData, StepExecutionStatus } from '../../../types';
import { BaseNode } from './BaseNode';

interface NodeProps {
    node: NodeType<ConditionNodeData>;
    onDrag: (id: string, pos: { x: number; y: number }) => void;
    onSelect: () => void;
    isSelected: boolean;
    onStartConnection: (sourceId: string, sourceHandle: string | null, e: React.MouseEvent) => void;
    onFinishConnection: (targetId: string, targetHandle: string | null) => void;
    status?: StepExecutionStatus;
    isReadOnly?: boolean;
}

export const ConditionNode = forwardRef<HTMLDivElement, NodeProps>((props, ref) => {
    const { node, onDrag, onSelect, isSelected, onStartConnection, onFinishConnection, status, isReadOnly } = props;

    return (
        <BaseNode
            ref={ref}
            title="Condition"
            type="Logic"
            color="bg-red-700 text-red-100"
            position={node.position}
            onDrag={(pos) => onDrag(node.id, pos)}
            onSelect={onSelect}
            isSelected={isSelected}
            status={status}
            isReadOnly={isReadOnly}
        >
            {!isReadOnly && (
                <div
                    data-handle="true"
                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full border-2 border-gray-800 hover:bg-indigo-400"
                    onMouseUp={() => onFinishConnection(node.id, null)}
                />
            )}

            <p className="text-white w-48 truncate">{node.data.label}</p>
            <div className="text-xs text-gray-400 mt-2">
                If <span className="font-mono bg-gray-700/50 p-1 rounded">{node.data.variable || '...'}</span>
            </div>

            {!isReadOnly && (
                <>
                    <div className="absolute -right-2 top-1/3 -translate-y-1/2">
                        <div
                            data-handle="true"
                            className="w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 hover:bg-green-400 cursor-pointer"
                            onMouseDown={(e) => onStartConnection(node.id, 'true', e)}
                        />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs text-gray-300">True</span>
                    </div>
                    <div className="absolute -right-2 top-2/3 -translate-y-1/2">
                        <div
                            data-handle="true"
                            className="w-4 h-4 bg-red-500 rounded-full border-2 border-gray-800 hover:bg-red-400 cursor-pointer"
                            onMouseDown={(e) => onStartConnection(node.id, 'false', e)}
                        />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs text-gray-300">False</span>
                    </div>
                </>
            )}
        </BaseNode>
    );
});
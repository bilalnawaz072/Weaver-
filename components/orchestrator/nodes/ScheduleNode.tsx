import React, { forwardRef } from 'react';
import { Node as NodeType, ScheduleNodeData, StepExecutionStatus } from '../../../types';
import { BaseNode } from './BaseNode';

interface NodeProps {
    node: NodeType<ScheduleNodeData>;
    onDrag: (id: string, pos: { x: number; y: number }) => void;
    onSelect: () => void;
    isSelected: boolean;
    onStartConnection: (sourceId: string, sourceHandle: string | null, e: React.MouseEvent) => void;
    onFinishConnection: (targetId: string, targetHandle: string | null) => void;
    status?: StepExecutionStatus;
    isReadOnly?: boolean;
}

export const ScheduleNode = forwardRef<HTMLDivElement, NodeProps>((props, ref) => {
    const { node, onDrag, onSelect, isSelected, onStartConnection, status, isReadOnly } = props;

    return (
        <BaseNode
            ref={ref}
            title="Schedule Trigger"
            type="Trigger"
            color="bg-sky-700 text-sky-100"
            position={node.position}
            onDrag={(pos) => onDrag(node.id, pos)}
            onSelect={onSelect}
            isSelected={isSelected}
            status={status}
            isReadOnly={isReadOnly}
        >
            <p className="text-white w-48 truncate">{node.data.label}</p>
            <p className="text-xs text-gray-400 mt-2">
                Runs every {node.data.interval} at {node.data.time}
            </p>

            {!isReadOnly && (
                <div
                    data-handle="true"
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full border-2 border-gray-800 hover:bg-indigo-400 cursor-pointer"
                    onMouseDown={(e) => onStartConnection(node.id, null, e)}
                />
            )}
        </BaseNode>
    );
});
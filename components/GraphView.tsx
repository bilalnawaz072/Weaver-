import React, { useMemo, useState } from 'react';

interface Node {
    id: string;
    label: string;
    type: 'task' | 'doc';
}

interface Edge {
    source: string;
    target: string;
    type: string;
}

interface GraphViewProps {
    data: {
        nodes: Node[];
        edges: Edge[];
    }
}

const nodeColors = {
    task: 'bg-indigo-500 border-indigo-400',
    doc: 'bg-teal-500 border-teal-400',
};
const nodeLabelColors = {
    task: 'text-indigo-100',
    doc: 'text-teal-100',
}

export const GraphView: React.FC<GraphViewProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ visible: boolean; content: React.ReactNode; x: number; y: number } | null>(null);

    const layout = useMemo(() => {
        const nodesWithPositions: (Node & { x: number; y: number })[] = [];
        const numNodes = data.nodes.length;
        if (numNodes === 0) return { nodesWithPositions, edges: data.edges };
        
        const canvasWidth = 1200;
        const canvasHeight = 800;
        const radius = Math.min(canvasWidth, canvasHeight) / 2 - 100;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        data.nodes.forEach((node, i) => {
            const angle = (i / numNodes) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            nodesWithPositions.push({ ...node, x, y });
        });

        return { nodesWithPositions, edges: data.edges };

    }, [data]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (tooltip?.visible) {
            setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
        }
    };
    
    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const showTooltip = (node: Node, e: React.MouseEvent) => {
        const content = (
          <>
            <div className="font-bold text-lg mb-2">{node.label}</div>
            <div className="border-t border-gray-600 pt-2 text-xs">
              <div><span className="font-semibold text-gray-400">Type:</span> <span className="capitalize">{node.type}</span></div>
              <div><span className="font-semibold text-gray-400">ID:</span> {node.id}</div>
            </div>
          </>
        );
        setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
    };

    const nodeMap = useMemo(() => new Map(layout.nodesWithPositions.map(n => [n.id, n])), [layout.nodesWithPositions]);

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {data.nodes.length === 0 ? (
                 <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-white">Graph is Empty</h3>
                        <p className="mt-1 text-sm text-gray-500">This project has no tasks or documents to display.</p>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full overflow-auto">
                    <div className="relative" style={{ width: 1200, height: 800 }}>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" >
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                                </marker>
                            </defs>
                            {layout.edges.map(edge => {
                                const sourceNode = nodeMap.get(edge.source);
                                const targetNode = nodeMap.get(edge.target);
                                if (!sourceNode || !targetNode) return null;
                                return (
                                    <line
                                        key={`${edge.source}-${edge.target}`}
                                        x1={sourceNode.x}
                                        y1={sourceNode.y}
                                        x2={targetNode.x}
                                        y2={targetNode.y}
                                        stroke="#6b7280"
                                        strokeWidth="2"
                                        markerEnd="url(#arrowhead)"
                                    />
                                );
                            })}
                        </svg>

                        {layout.nodesWithPositions.map(node => (
                            <div
                                key={node.id}
                                className={`absolute p-3 rounded-lg shadow-lg border-2 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${nodeColors[node.type]}`}
                                style={{
                                    left: node.x - 50,
                                    top: node.y - 25,
                                    width: 150,
                                    height: 50,
                                }}
                                onMouseEnter={(e) => showTooltip(node, e)}
                            >
                                <span className={`font-semibold text-sm truncate ${nodeLabelColors[node.type]}`}>{node.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
             {tooltip && tooltip.visible && (
                <div
                    style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
                    className="fixed bg-gray-900 border border-gray-600 rounded-lg p-4 shadow-2xl z-50 max-w-xs pointer-events-none transition-opacity duration-200"
                    role="tooltip"
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

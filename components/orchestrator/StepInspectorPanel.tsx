import React from 'react';
import { StepExecution } from '../../types';
import { RunStatusBadge } from './RunStatusBadge'; // Assuming a similar badge for step status
import { StepExecutionStatus, WorkflowRunStatus } from '../../types';

const StepStatusBadge: React.FC<{ status: StepExecutionStatus }> = ({ status }) => {
    const styles = {
        [StepExecutionStatus.Succeeded]: 'bg-green-600 text-green-100',
        [StepExecutionStatus.Failed]: 'bg-red-600 text-red-100',
        [StepExecutionStatus.Skipped]: 'bg-gray-600 text-gray-100',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
}

const DataViewer: React.FC<{ title: string, data: any }> = ({ title, data }) => {
    const formattedData = data ? JSON.stringify(data, null, 2) : 'null';
    return (
        <div>
            <h4 className="text-md font-semibold text-gray-300 mb-2">{title}</h4>
            <pre className="text-xs bg-gray-900 border border-gray-700 rounded-md p-3 overflow-x-auto text-gray-200">
                <code>{formattedData}</code>
            </pre>
        </div>
    )
}

interface StepInspectorPanelProps {
    selectedStep: StepExecution | undefined;
}

export const StepInspectorPanel: React.FC<StepInspectorPanelProps> = ({ selectedStep }) => {
    return (
        <aside className="w-96 bg-gray-800/50 p-4 border-l border-gray-700 flex-shrink-0 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Step Inspector</h3>
            {selectedStep ? (
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-gray-400">Node ID</p>
                        <p className="font-mono text-white">{selectedStep.nodeId}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400 mb-1">Status</p>
                        <StepStatusBadge status={selectedStep.status} />
                    </div>

                    {selectedStep.status === StepExecutionStatus.Failed && selectedStep.errorMessage && (
                        <div>
                            <h4 className="text-md font-semibold text-red-400 mb-2">Error Message</h4>
                            <pre className="text-xs bg-red-900/50 border border-red-700 rounded-md p-3 overflow-x-auto text-red-200 whitespace-pre-wrap">
                                <code>{selectedStep.errorMessage}</code>
                            </pre>
                        </div>
                    )}
                    
                    <DataViewer title="Input Data" data={selectedStep.inputData} />
                    <DataViewer title="Output Data" data={selectedStep.outputData} />

                </div>
            ) : (
                <div className="text-center text-gray-400 pt-10">
                    <p>Select a step on the canvas to inspect its details.</p>
                </div>
            )}
        </aside>
    );
};
import React, { useState } from 'react';
import { Workflow, WorkflowDefinition } from '../../types';
import { AgentList } from './AgentList';
import { AgentCanvas } from './AgentCanvas';

interface OrchestratorViewProps {
    workflows: Workflow[];
    onCreateWorkflow: () => string; // Returns the ID of the new workflow
    onSaveWorkflow: (workflowId: string, name: string, definition: WorkflowDefinition) => void;
}

export const OrchestratorView: React.FC<OrchestratorViewProps> = (props) => {
    const { workflows, onCreateWorkflow, onSaveWorkflow } = props;
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    const handleCreateAndEdit = () => {
        const newId = onCreateWorkflow();
        setSelectedWorkflowId(newId);
    };

    const handleSelectWorkflow = (id: string) => {
        setSelectedWorkflowId(id);
    };

    const handleBackToList = () => {
        setSelectedWorkflowId(null);
    }
    
    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);

    return (
        <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex flex-col gap-6 overflow-hidden">
            {selectedWorkflow ? (
                 <AgentCanvas 
                    key={selectedWorkflow.id}
                    workflow={selectedWorkflow}
                    onSave={onSaveWorkflow}
                    onBack={handleBackToList}
                 />
            ) : (
                <AgentList
                    workflows={workflows}
                    onSelectWorkflow={handleSelectWorkflow}
                    onCreateWorkflow={handleCreateAndEdit}
                />
            )}
        </main>
    );
};

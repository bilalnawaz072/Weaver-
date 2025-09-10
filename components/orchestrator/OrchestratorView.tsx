import React, { useState, useMemo } from 'react';
import { Workflow, WorkflowDefinition, Prompt, WorkflowRun, StepExecution, Project } from '../../types';
import { AgentList } from './AgentList';
import { AgentCanvas } from './AgentCanvas';
import { RunHistoryList } from './RunHistoryList';
import { RunDetailView } from './RunDetailView';

interface OrchestratorViewProps {
    workflows: Workflow[];
    workflowRuns: WorkflowRun[];
    stepExecutions: StepExecution[];
    prompts: Prompt[];
    projects: Project[];
    onCreateWorkflow: () => string; // Returns the ID of the new workflow
    onSaveWorkflow: (workflowId: string, name: string, definition: WorkflowDefinition) => void;
}

export const OrchestratorView: React.FC<OrchestratorViewProps> = (props) => {
    const { workflows, workflowRuns, stepExecutions, prompts, projects, onCreateWorkflow, onSaveWorkflow } = props;
    
    const [viewMode, setViewMode] = useState<'builder' | 'runs'>('builder');
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

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
    
    const handleSelectRun = (runId: string) => {
        setSelectedRunId(runId);
    };

    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);
    
    const selectedRunData = useMemo(() => {
        if (!selectedRunId) return null;
        const run = workflowRuns.find(r => r.id === selectedRunId);
        if (!run) return null;
        const workflow = workflows.find(w => w.id === run.workflowId);
        if (!workflow) return null;
        const steps = stepExecutions.filter(s => s.runId === run.id);
        return { run, workflow, steps };
    }, [selectedRunId, workflowRuns, workflows, stepExecutions]);


    const renderContent = () => {
        if (viewMode === 'runs') {
            if (selectedRunData) {
                return (
                    <RunDetailView
                        run={selectedRunData.run}
                        workflow={selectedRunData.workflow}
                        stepExecutions={selectedRunData.steps}
                        onBack={() => setSelectedRunId(null)}
                    />
                );
            }
            return (
                <RunHistoryList
                    runs={workflowRuns}
                    onSelectRun={handleSelectRun}
                />
            );
        }
        
        // Builder mode
        if (selectedWorkflow) {
             return (
                <AgentCanvas 
                    key={selectedWorkflow.id}
                    workflow={selectedWorkflow}
                    prompts={prompts}
                    projects={projects}
                    onSave={onSaveWorkflow}
                    onBack={handleBackToList}
                />
             );
        }
        return (
            <AgentList
                workflows={workflows}
                onSelectWorkflow={handleSelectWorkflow}
                onCreateWorkflow={handleCreateAndEdit}
            />
        );
    };

    return (
        <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex flex-col gap-6 overflow-hidden">
             <div className="flex items-center bg-gray-800 p-1 rounded-lg flex-shrink-0">
                <button
                    onClick={() => setViewMode('builder')}
                    className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'builder' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    Builder
                </button>
                <button
                    onClick={() => setViewMode('runs')}
                    className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'runs' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    Runs
                </button>
            </div>
            {renderContent()}
        </main>
    );
};
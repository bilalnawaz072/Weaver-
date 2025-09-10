

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
// FIX: Add Whiteboard and WhiteboardElement to imports
import { Task, Status, TaskSortKey, Project, Space, CustomFieldDefinition, CustomFieldValue, CustomFieldType, Doc, Prompt, Workflow, WorkflowDefinition, NodeType, WorkflowRun, StepExecution, WorkflowRunStatus, StepExecutionStatus, HttpRequestNodeData, CreateTaskNodeData, SearchableEntity, Prediction, InsightSuggestion, Insight, PredictionType, RiskLevel, SuggestionType, SuggestionStatus, Whiteboard, WhiteboardElement } from './types';
import { TaskTable } from './components/TaskTable';
import { TaskFormModal } from './components/TaskFormModal';
import { NavigationSidebar } from './components/NavigationSidebar';
import { ProjectFormModal } from './components/ProjectFormModal';
import { SpaceFormModal } from './components/SpaceFormModal';
import { PlusIcon, TableCellsIcon, ViewColumnsIcon, Cog6ToothIcon, DocumentTextIcon, ChartBarIcon, CalendarDaysIcon, ShareIcon, ChartPieIcon } from './components/icons';
import { ConfirmationModal } from './components/ConfirmationModal';
import { KanbanView } from './components/KanbanView';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { DocEditor } from './components/DocEditor';
import { TimelineView } from './components/TimelineView';
import { CalendarView } from './components/CalendarView';
import { FoundryView } from './components/foundry/FoundryView';
import { MindMapView } from './components/MindMapView';
import { GraphView } from './components/GraphView';
import { OrchestratorView } from './components/orchestrator/OrchestratorView';
import { GlobalSearchBar } from './components/intelligence/GlobalSearchBar';
import { SearchResultsModal } from './components/intelligence/SearchResultsModal';
import { InsightsDashboard } from './components/intelligence/ai-pm/InsightsDashboard';
import { GoogleGenAI, type Chat, Type } from "@google/genai";
// FIX: Import WhiteboardView and AIConversionModal
import { WhiteboardView } from './components/WhiteboardView';
import { AIConversionModal } from './components/whiteboard/AIConversionModal';

const initialSpaces: Space[] = [
    { id: 'space-1', name: 'Product Development', createdAt: new Date(), updatedAt: new Date() },
    { id: 'space-2', name: 'Marketing', createdAt: new Date(), updatedAt: new Date() },
];

const initialProjects: Project[] = [
  { id: 'proj-1', spaceId: 'space-1', name: 'Weaver App Development', description: 'Core development tasks for the Weaver application.', mindMapData: null, health: { level: 'yellow', reason: '1 task is predicted to be late.' }, createdAt: new Date(2023, 10, 1), updatedAt: new Date(2023, 10, 1) },
  { id: 'proj-2', spaceId: 'space-2', name: 'Q1 Marketing', description: 'Marketing campaigns for the first quarter.', mindMapData: null, health: { level: 'green', reason: 'All tasks on schedule.' }, createdAt: new Date(2023, 10, 2), updatedAt: new Date(2023, 10, 2) },
  { id: 'proj-3', spaceId: 'space-1', name: 'API Integration', description: 'Integrating third-party APIs.', mindMapData: null, createdAt: new Date(2023, 10, 5), updatedAt: new Date(2023, 10, 5) },
];

const initialTasks: Task[] = [
  { id: '1', projectId: 'proj-1', parentTaskId: null, title: 'Setup project boilerplate', description: 'Initialize React project with TypeScript and Tailwind CSS.', status: Status.Done, startDate: new Date(2023, 10, 1), dueDate: new Date(2023, 10, 2), createdAt: new Date(2023, 10, 1, 9, 0), updatedAt: new Date(2023, 10, 1, 14, 30) },
  { id: '2', projectId: 'proj-1', parentTaskId: null, title: 'Create Core Entities', description: 'Define data models for Space, Project, Task.', status: Status.Done, startDate: new Date(2023, 10, 3), dueDate: new Date(2023, 10, 5), createdAt: new Date(2023, 10, 1, 10, 15), updatedAt: new Date(2023, 10, 1, 15, 0) },
  { id: '3', projectId: 'proj-1', parentTaskId: '2', title: 'Define Task type', description: '', status: Status.Done, startDate: new Date(2023, 10, 3), dueDate: new Date(2023, 10, 3), createdAt: new Date(2023, 10, 1, 11, 0), updatedAt: new Date(2023, 10, 1, 11, 30) },
  { id: '4', projectId: 'proj-1', parentTaskId: '2', title: 'Define Project type', description: '', status: Status.Done, startDate: new Date(2023, 10, 4), dueDate: new Date(2023, 10, 4), createdAt: new Date(2023, 10, 1, 11, 30), updatedAt: new Date(2023, 10, 1, 12, 0) },
  { id: '5', projectId: 'proj-1', parentTaskId: null, title: 'Develop UI Components', description: 'Build the main UI views and components.', status: Status.InProgress, startDate: new Date(2023, 10, 6), dueDate: new Date(2023, 10, 18), createdAt: new Date(2023, 10, 2, 11, 0), updatedAt: new Date(2023, 10, 2, 16, 45) },
  { id: '6', projectId: 'proj-1', parentTaskId: '5', title: 'Implement Navigation Sidebar', description: 'With Spaces and Projects.', status: Status.InProgress, startDate: new Date(2023, 10, 8), dueDate: new Date(2023, 10, 12), createdAt: new Date(2023, 10, 3, 8, 30), updatedAt: new Date(2023, 10, 3, 8, 30) },
  { id: '7', projectId: 'proj-1', parentTaskId: '5', title: 'Implement Kanban View', description: 'With drag-and-drop functionality.', status: Status.Todo, startDate: new Date(2023, 10, 13), dueDate: new Date(2023, 10, 18), createdAt: new Date(2023, 10, 3, 9, 0), updatedAt: new Date(2023, 10, 3, 9, 0) },
  { id: '8', projectId: 'proj-2', parentTaskId: null, title: 'Draft blog post', description: 'Write a blog post about the new features.', status: Status.Todo, startDate: null, dueDate: new Date(2023, 10, 25), createdAt: new Date(2023, 10, 3, 9, 0), updatedAt: new Date(2023, 10, 3, 9, 0) },
];

const textToTipTapJson = (text: string) => {
    return {
        type: 'doc',
        content: text.split('\n').filter(p => p.trim() !== '').map(paragraph => ({
            type: 'paragraph',
            content: paragraph ? [{ type: 'text', text: paragraph }] : []
        }))
    };
};

const tiptapJsonToText = (node: any): string => {
    if (!node) return '';
    if (node.type === 'text' && node.text) {
        return node.text;
    }
    if (node.content && Array.isArray(node.content)) {
        return node.content.map(tiptapJsonToText).join(node.type === 'doc' ? '\n\n' : '');
    }
    return '';
};

const initialDocs: Doc[] = [
    { id: 'doc-1', projectId: 'proj-1', title: 'Project Charter', content: textToTipTapJson('This document outlines the scope, objectives, and participants of the Weaver App Development project.'), createdAt: new Date(2023, 10, 1, 8, 0), updatedAt: new Date(2023, 10, 1, 9, 0)},
    { id: 'doc-2', projectId: 'proj-1', title: 'Technical Specification', content: textToTipTapJson('## Core Technologies\n- React\n- TypeScript\n- TailwindCSS'), createdAt: new Date(2023, 10, 2, 14, 0), updatedAt: new Date(2023, 10, 3, 10, 0)},
    { id: 'doc-3', projectId: 'proj-2', title: 'Campaign Brief', content: textToTipTapJson('Brief for the Q1 marketing campaign.'), createdAt: new Date(2023, 10, 4, 11, 0), updatedAt: new Date(2023, 10, 4, 11, 0)},
];

// FIX: Add initial data for whiteboards
const initialWhiteboards: Whiteboard[] = [
    { id: 'wb-1', projectId: 'proj-1', title: 'Q1 Strategy Brainstorm', elements: [], createdAt: new Date(), updatedAt: new Date() },
];

const initialCustomFieldDefinitions: CustomFieldDefinition[] = [
    { id: 'cfd-1', projectId: 'proj-1', name: 'Priority', type: CustomFieldType.Select, options: ['High', 'Medium', 'Low'] },
    { id: 'cfd-2', projectId: 'proj-1', name: 'Estimate (hrs)', type: CustomFieldType.Number },
];

const initialCustomFieldValues: CustomFieldValue[] = [
    { id: 'cfv-1', taskId: '5', fieldDefinitionId: 'cfd-1', value: 'High' },
    { id: 'cfv-2', taskId: '5', fieldDefinitionId: 'cfd-2', value: 8 },
    { id: 'cfv-3', taskId: '6', fieldDefinitionId: 'cfd-1', value: 'High' },
    { id: 'cfv-4', taskId: '7', fieldDefinitionId: 'cfd-1', value: 'Medium' },
];

const initialPrompts: Prompt[] = [
    { id: 'p-1', name: 'Summarize Text', description: 'Summarizes the content of the document.', promptText: 'Please summarize the following text in a single, concise paragraph:\n\n{{document_content}}', contextVariableName: 'document_content', createdAt: new Date(), updatedAt: new Date() },
    { id: 'p-2', name: 'Generate Blog Post Ideas', description: 'Creates a list of blog post ideas based on a topic.', promptText: 'Generate a list of 5 creative blog post titles about the topic of {{topic}}.', contextVariableName: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 'p-3', name: 'Brainstorm Next Steps', description: 'Reads a document and suggests next steps.', promptText: 'Based on the following document, please brainstorm a list of 3-5 actionable next steps or tasks:\n\n{{document_content}}', contextVariableName: 'document_content', createdAt: new Date(), updatedAt: new Date() },
];

const initialWorkflows: Workflow[] = [
    {
        id: 'wf-1',
        name: 'Daily Project Summary',
        isActive: true,
        definition: {
            nodes: [
                { id: 'n-1', type: NodeType.TriggerSchedule, position: { x: 50, y: 150 }, data: { label: 'Every Day at 9am', interval: 'day', time: '09:00' } },
                { id: 'n-2', type: NodeType.LogicIf, position: { x: 350, y: 150 }, data: { label: 'Is it a weekday?', variable: 'date.dayOfWeek', operator: 'lt', value: '6' } },
            ],
            edges: [
                { id: 'e-1-2', source: 'n-1', target: 'n-2', sourceHandle: null, targetHandle: null },
            ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

const initialWorkflowRuns: WorkflowRun[] = [
    {
        id: 'run-1',
        workflowId: 'wf-1',
        workflowName: 'Daily Project Summary',
        status: WorkflowRunStatus.Succeeded,
        startedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        endedAt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 - 5000)), // 5 seconds later
    },
    {
        id: 'run-2',
        workflowId: 'wf-1',
        workflowName: 'Daily Project Summary',
        status: WorkflowRunStatus.Failed,
        startedAt: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        endedAt: new Date(new Date().getTime() - (2 * 60 * 60 * 1000 - 2000)), // 2 seconds later
    },
    {
        id: 'run-3',
        workflowId: 'wf-1',
        workflowName: 'Daily Project Summary',
        status: WorkflowRunStatus.Running,
        startedAt: new Date(),
        endedAt: null,
    },
];

const initialStepExecutions: StepExecution[] = [
    // Run 1 (Success)
    { id: 'se-1-1', runId: 'run-1', nodeId: 'n-1', status: StepExecutionStatus.Succeeded, inputData: null, outputData: { timestamp: '2024-01-01T09:00:00Z', dayOfWeek: 1 }, startedAt: new Date(), endedAt: new Date() },
    { id: 'se-1-2', runId: 'run-1', nodeId: 'n-2', status: StepExecutionStatus.Succeeded, inputData: { 'date.dayOfWeek': 1 }, outputData: { conditionResult: true }, startedAt: new Date(), endedAt: new Date() },
    // Run 2 (Failure)
    { id: 'se-2-1', runId: 'run-2', nodeId: 'n-1', status: StepExecutionStatus.Succeeded, inputData: null, outputData: { timestamp: '2024-01-02T09:00:00Z', dayOfWeek: 2 }, startedAt: new Date(), endedAt: new Date() },
    { id: 'se-2-2', runId: 'run-2', nodeId: 'n-2', status: StepExecutionStatus.Failed, inputData: { 'date.dayOfWeek': 2 }, outputData: null, errorMessage: 'Failed to evaluate condition: variable `date.dayOfWeek` is not a number.', startedAt: new Date(), endedAt: new Date() },
     // Run 3 (Running)
    { id: 'se-3-1', runId: 'run-3', nodeId: 'n-1', status: StepExecutionStatus.Succeeded, inputData: null, outputData: { timestamp: '2024-01-03T09:00:00Z', dayOfWeek: 3 }, startedAt: new Date(), endedAt: new Date() },
];

const initialPredictions: Prediction[] = [
    {
        id: 'pred-1',
        entityType: 'task',
        entityId: '7', // "Implement Kanban View"
        type: PredictionType.CompletionDate,
        predictedValue: { date: new Date(2023, 10, 22).toISOString() }, // Original due date is 18th
        confidenceScore: 0.85,
        factors: ['Assignee workload', 'Historical task duration for similar tasks'],
        createdAt: new Date(),
    },
    {
        id: 'pred-2',
        entityType: 'project',
        entityId: 'proj-1',
        type: PredictionType.RiskLevel,
        predictedValue: { level: RiskLevel.Medium },
        confidenceScore: 0.78,
        factors: ['Multiple tasks approaching deadlines', '1 critical path task is behind schedule'],
        createdAt: new Date(),
    },
];

const initialSuggestions: InsightSuggestion[] = [
    {
        id: 'sugg-1',
        type: SuggestionType.DeadlineAdjustment,
        targetEntityId: '7', // "Implement Kanban View"
        suggestion: {
            message: "Adjust 'Implement Kanban View' deadline to Nov 22, 2023 to match prediction.",
            details: { newDueDate: new Date(2023, 10, 22).toISOString() }
        },
        reasoning: "The predicted completion date is 4 days after the current due date. Adjusting it will set more realistic expectations.",
        impactScore: 0.6,
        status: SuggestionStatus.Pending,
        createdAt: new Date(),
    },
    {
        id: 'sugg-2',
        type: SuggestionType.Priority,
        targetEntityId: '6', // "Implement Navigation Sidebar"
        suggestion: {
            message: "Increase priority of 'Implement Navigation Sidebar' task.",
            details: { newPriority: 'High' }
        },
        reasoning: "This task is a dependency for 'Implement Kanban View' which is predicted to be late. Completing this sooner may mitigate the delay.",
        impactScore: 0.8,
        status: SuggestionStatus.Pending,
        createdAt: new Date(),
    }
];


const getUpdatedTasksWithPropagation = (
    tasks: Task[], 
    taskId: string, 
    newData: Partial<Task>
): Task[] => {
    const tasksMap = new Map(tasks.map(t => [t.id, { ...t }]));
    const mainTask = tasksMap.get(taskId);

    if (!mainTask) return tasks;

    const oldStatus = mainTask.status;
    
    Object.assign(mainTask, newData, { updatedAt: new Date() });
    
    const newStatus = mainTask.status;

    if (oldStatus !== newStatus && newStatus) {
        if (newStatus === Status.InProgress || newStatus === Status.Todo) {
            let currentTask = mainTask;
            while (currentTask.parentTaskId) {
              const parentTask = tasksMap.get(currentTask.parentTaskId);
              if (parentTask && parentTask.status === Status.Done) {
                parentTask.status = Status.InProgress;
                parentTask.updatedAt = new Date();
                currentTask = parentTask;
              } else {
                break; 
              }
            }
        }
      
        if (newStatus === Status.Done) {
            const queue: string[] = [taskId];
            while (queue.length > 0) {
              const parentId = queue.shift()!;
              for (const task of tasksMap.values()) {
                  if (task.parentTaskId === parentId) {
                      if (task.status !== Status.Done) {
                          task.status = Status.Done;
                          task.updatedAt = new Date();
                      }
                      queue.push(task.id);
                  }
              }
            }
        }
    }
    
    return Array.from(tasksMap.values());
};

// FIX: Define types for graph data to satisfy GraphView component props.
interface GraphNode {
    id: string;
    label: string;
    type: 'task' | 'doc';
}

interface GraphEdge {
    source: string;
    target: string;
    type: string;
}

const App: React.FC = () => {
  // Workspace State
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  // FIX: Add state for whiteboards
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>(initialWhiteboards);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>(initialCustomFieldDefinitions);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>(initialCustomFieldValues);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'kanban' | 'timeline' | 'calendar' | 'mindmap' | 'graph'>('table');
  // FIX: Add 'whiteboard' to active content type
  const [activeContentType, setActiveContentType] = useState<'tasks' | 'doc' | 'whiteboard'>('tasks');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  // FIX: Add state for active whiteboard
  const [activeWhiteboardId, setActiveWhiteboardId] = useState<string | null>(null);
  
  const [sortConfig, setSortConfig] = useState<{ key: TaskSortKey | null; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
  const [visibleTableColumns, setVisibleTableColumns] = useState<string[]>(['title', 'status', 'startDate', 'dueDate', 'createdAt']);
  
  // Foundry State
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  
  // Orchestrator State
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>(initialWorkflowRuns);
  const [stepExecutions, setStepExecutions] = useState<StepExecution[]>(initialStepExecutions);

  // Global App State
  const [activeMainView, setActiveMainView] = useState<'workspace' | 'foundry' | 'orchestrator' | 'insights'>('workspace');
  
  // Intelligence Layer State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchableEntity[]>([]);
  const [synthesizedAnswer, setSynthesizedAnswer] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>(initialPredictions);
  const [suggestions, setSuggestions] = useState<InsightSuggestion[]>(initialSuggestions);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [parentTaskIdForNewTask, setParentTaskIdForNewTask] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [spaceIdForNewProject, setSpaceIdForNewProject] = useState<string | null>(null);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [spaceToEdit, setSpaceToEdit] = useState<Space | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // FIX: Add 'whiteboard' to item to delete type
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'space' | 'project' | 'task' | 'customField' | 'doc' | 'prompt' | 'whiteboard' } | null>(null);
  const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const searchRequestController = useRef(0);
  // FIX: Add state for AI conversion modal
  const [isAIConversionModalOpen, setIsAIConversionModalOpen] = useState(false);
  const [aiConversionIsLoading, setAiConversionIsLoading] = useState(false);
  const [aiConversionError, setAiConversionError] = useState<string | null>(null);
  const [proposedTasks, setProposedTasks] = useState<{title: string; description: string}[]>([]);


  // Effects
  useEffect(() => {
    if (process.env.API_KEY && !aiRef.current) {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }, []);

  useEffect(() => {
    if (activeMainView === 'workspace' && !selectedProjectId && projects.length > 0) {
        setSelectedProjectId(projects[0].id);
        setActiveContentType('tasks');
        setActiveDocId(null);
    }
  }, [projects, selectedProjectId, activeMainView]);
  
  useEffect(() => {
    if (activeMainView === 'foundry' && !selectedPromptId && prompts.length > 0) {
        setSelectedPromptId(prompts[0].id);
    }
  }, [prompts, selectedPromptId, activeMainView]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
            setIsCreateMenuOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [createMenuRef]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Derived State
  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const selectedSpace = useMemo(() => spaces.find(s => s.id === selectedProject?.spaceId), [spaces, selectedProject]);
  const activeDoc = useMemo(() => docs.find(d => d.id === activeDocId), [docs, activeDocId]);
  const selectedPrompt = useMemo(() => prompts.find(p => p.id === selectedPromptId), [prompts, selectedPromptId]);

  const tasksForSelectedProject = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter(task => task.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);
  
  const docsForSelectedProject = useMemo(() => {
    if (!selectedProjectId) return [];
    return docs.filter(doc => doc.projectId === selectedProjectId);
  }, [docs, selectedProjectId]);


  const customFieldDefinitionsForProject = useMemo(() => {
    if (!selectedProjectId) return [];
    return customFieldDefinitions.filter(def => def.projectId === selectedProjectId);
  }, [customFieldDefinitions, selectedProjectId]);
  
  const customFieldValuesMap = useMemo(() => 
    new Map(customFieldValues.map(v => [`${v.taskId}-${v.fieldDefinitionId}`, v.value])), 
  [customFieldValues]);

  // Hierarchical Task Processing
  const taskTree = useMemo(() => {
    const taskMap = new Map(tasksForSelectedProject.map(task => [task.id, { ...task, subtasks: [] as Task[] }]));
    const rootTasks: (Task & { subtasks: Task[] })[] = [];

    for (const task of taskMap.values()) {
        if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
            taskMap.get(task.parentTaskId)!.subtasks.push(task);
        } else {
            rootTasks.push(task);
        }
    }
    return rootTasks;
  }, [tasksForSelectedProject]);

  const rootTasksForKanban = useMemo(() => {
    if (!selectedProjectId) return [];
    const projectTasks = tasks.filter(task => task.projectId === selectedProjectId);
    const taskMap = new Map(projectTasks.map(task => [task.id, { ...task, subtasks: [] as Task[] }]));
    
    const rootTasks: any[] = []; // will be KanbanTask[]

    for (const task of taskMap.values()) {
        if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
            taskMap.get(task.parentTaskId)!.subtasks.push(task);
        } else {
            rootTasks.push(task);
        }
    }

    // Add counts to all tasks in the map and sort subtasks
    for (const task of taskMap.values()) {
        const subtasks = task.subtasks || [];
        task.subtasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        (task as any).subtaskCount = subtasks.length;
        (task as any).completedSubtaskCount = subtasks.filter(t => t.status === Status.Done).length;
    }
    
    return rootTasks;
  }, [tasks, selectedProjectId]);

  // Sorting & Flattening for Table View
  const requestSort = (key: TaskSortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const flattenedSortedTasks = useMemo(() => {
    const sortTasks = (tasksToSort: any[], level: number): (Task & { level: number })[] => {
      let sorted = [...tasksToSort];
      if (sortConfig.key) {
        sorted.sort((a, b) => {
          const valA = a[sortConfig.key!];
          const valB = b[sortConfig.key!];
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        });
      }
      
      let result: (Task & { level: number })[] = [];
      for (const task of sorted) {
        result.push({ ...task, level });
        if (task.subtasks && task.subtasks.length > 0) {
            result = result.concat(sortTasks(task.subtasks, level + 1));
        }
      }
      return result;
    };
    return sortTasks(taskTree, 0);
  }, [taskTree, sortConfig]);
  
  const graphDataForSelectedProject = useMemo<{ nodes: GraphNode[], edges: GraphEdge[] }>(() => {
    if (!selectedProjectId) return { nodes: [], edges: [] };

    const nodes: GraphNode[] = [
        ...tasksForSelectedProject.map(t => ({ id: t.id, label: t.title, type: 'task' as const })),
        ...docsForSelectedProject.map(d => ({ id: d.id, label: d.title, type: 'doc' as const })),
    ];

    const edges: GraphEdge[] = tasksForSelectedProject
        .filter(t => t.parentTaskId && tasksForSelectedProject.some(p => p.id === t.parentTaskId))
        .map(t => ({ source: t.parentTaskId!, target: t.id, type: 'subtask' }));
    
    return { nodes, edges };
  }, [selectedProjectId, tasksForSelectedProject, docsForSelectedProject]);


  // Navigation Handlers
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveContentType('tasks');
    setActiveDocId(null);
    setActiveWhiteboardId(null);
    setActiveView('table');
  };
  const handleSelectDoc = (docId: string) => {
    const doc = docs.find(d => d.id === docId);
    if (doc) {
        setSelectedProjectId(doc.projectId);
        setActiveContentType('doc');
        setActiveDocId(docId);
        setActiveWhiteboardId(null);
    }
  };
    // FIX: Add whiteboard selection handler
    const handleSelectWhiteboard = (whiteboardId: string) => {
        const whiteboard = whiteboards.find(w => w.id === whiteboardId);
        if (whiteboard) {
            setSelectedProjectId(whiteboard.projectId);
            setActiveContentType('whiteboard');
            setActiveDocId(null);
            setActiveWhiteboardId(whiteboardId);
        }
    };


  // Space Handlers
  const handleOpenCreateSpaceModal = () => { setSpaceToEdit(null); setIsSpaceModalOpen(true); };
  const handleOpenEditSpaceModal = (space: Space) => { setSpaceToEdit(space); setIsSpaceModalOpen(true); };
  const handleCloseSpaceModal = () => { setIsSpaceModalOpen(false); setSpaceToEdit(null); };

  const handleSaveSpace = (data: { name: string }) => {
    if (spaceToEdit) {
      setSpaces(spaces.map(s => s.id === spaceToEdit.id ? { ...s, ...data, updatedAt: new Date() } : s));
    } else {
      const newSpace: Space = { id: crypto.randomUUID(), ...data, createdAt: new Date(), updatedAt: new Date() };
      setSpaces([...spaces, newSpace]);
    }
    handleCloseSpaceModal();
  };
  
  const handleDeleteSpace = (id: string) => { setItemToDelete({ id, type: 'space' }); setIsConfirmModalOpen(true); };

  // Project Handlers
  const handleOpenCreateProjectModal = (spaceId: string) => { setProjectToEdit(null); setSpaceIdForNewProject(spaceId); setIsProjectModalOpen(true); };
  const handleOpenEditProjectModal = (project: Project) => { setProjectToEdit(project); setIsProjectModalOpen(true); };
  const handleCloseProjectModal = () => { setIsProjectModalOpen(false); setProjectToEdit(null); setSpaceIdForNewProject(null); };
  
  const handleSaveProject = (data: { name: string; description: string }) => {
    if (projectToEdit) {
      setProjects(projects.map(p => p.id === projectToEdit.id ? { ...p, ...data, updatedAt: new Date() } : p));
    } else if (spaceIdForNewProject) {
      const newProject: Project = { id: crypto.randomUUID(), spaceId: spaceIdForNewProject, ...data, mindMapData: null, createdAt: new Date(), updatedAt: new Date() };
      setProjects([...projects, newProject]);
      handleSelectProject(newProject.id); // Select new project
    }
    handleCloseProjectModal();
  };

  const handleDeleteProject = (id: string) => { setItemToDelete({ id, type: 'project' }); setIsConfirmModalOpen(true); };

  // Task Handlers
  const handleOpenCreateTaskModal = () => { setTaskToEdit(null); setParentTaskIdForNewTask(null); setIsTaskModalOpen(true); };
  const handleOpenCreateSubtaskModal = (parentTaskId: string) => { setTaskToEdit(null); setParentTaskIdForNewTask(parentTaskId); setIsTaskModalOpen(true); };
  const handleOpenEditTaskModal = (task: Task) => { setTaskToEdit(task); setParentTaskIdForNewTask(null); setIsTaskModalOpen(true); };
  const handleCloseTaskModal = () => { setIsTaskModalOpen(false); setTaskToEdit(null); setParentTaskIdForNewTask(null); };
  const handleDeleteTask = (id: string) => { setItemToDelete({ id, type: 'task' }); setIsConfirmModalOpen(true); };

  const handleSaveTask = (taskData: { title: string; description: string; status: Status; startDate: Date | null; dueDate: Date | null }, newCustomFieldValues: { [key: string]: any }) => {
    if (!selectedProjectId) return;
    
    let savedTask: Task;
    if (taskToEdit) {
      const updatedData = { ...taskToEdit, ...taskData, updatedAt: new Date() };
      savedTask = updatedData;
      setTasks(prevTasks => getUpdatedTasksWithPropagation(prevTasks, taskToEdit.id, taskData));
    } else {
      savedTask = {
        id: crypto.randomUUID(),
        projectId: selectedProjectId,
        parentTaskId: parentTaskIdForNewTask,
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTasks(prevTasks => [...prevTasks, savedTask]);
    }

    // Update custom field values
    const remainingValues = customFieldValues.filter(v => v.taskId !== savedTask.id);
    const updatedValues: CustomFieldValue[] = [];
    for (const fieldId in newCustomFieldValues) {
      const value = newCustomFieldValues[fieldId];
      if (value !== null && value !== undefined && value !== '') {
        updatedValues.push({
          id: crypto.randomUUID(),
          taskId: savedTask.id,
          fieldDefinitionId: fieldId,
          value: value
        });
      }
    }
    setCustomFieldValues([...remainingValues, ...updatedValues]);

    handleCloseTaskModal();
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Status) => {
    setTasks(prevTasks => getUpdatedTasksWithPropagation(prevTasks, taskId, { status: newStatus }));
  };

  // Doc Handlers
  const handleCreateDoc = (projectId: string) => {
    const newDoc: Doc = {
      id: crypto.randomUUID(),
      projectId,
      title: 'Untitled Document',
      content: { type: 'doc', content: [{ type: 'paragraph' }] }, // Initialize with empty TipTap structure
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocs(prev => [...prev, newDoc]);
    handleSelectDoc(newDoc.id);
  };
  const handleSaveDoc = (docId: string, data: { title: string; content: any }) => {
    setDocs(docs => docs.map(d => d.id === docId ? { ...d, ...data, updatedAt: new Date() } : d));
  };
  const handleDeleteDoc = (id: string) => { setItemToDelete({ id, type: 'doc' }); setIsConfirmModalOpen(true); };

    // FIX: Add whiteboard handlers
    const handleCreateWhiteboard = (projectId: string) => {
        const newWhiteboard: Whiteboard = {
            id: crypto.randomUUID(),
            projectId,
            title: 'Untitled Whiteboard',
            elements: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setWhiteboards(prev => [...prev, newWhiteboard]);
        handleSelectWhiteboard(newWhiteboard.id);
    };
    const handleSaveWhiteboard = (whiteboard: Whiteboard) => {
        setWhiteboards(wbs => wbs.map(wb => wb.id === whiteboard.id ? whiteboard : wb));
    };
    const handleDeleteWhiteboard = (id: string) => {
        setItemToDelete({ id, type: 'whiteboard' });
        setIsConfirmModalOpen(true);
    };

  // Custom Field Definition Handlers
  const handleSaveCustomFieldDefinition = (definition: Omit<CustomFieldDefinition, 'id' | 'projectId'> | CustomFieldDefinition) => {
    if (!selectedProjectId) return;
    if ('id' in definition) { // Update
      setCustomFieldDefinitions(defs => defs.map(d => d.id === definition.id ? { ...d, ...definition } : d));
    } else { // Create
      const newDef: CustomFieldDefinition = { ...definition, id: crypto.randomUUID(), projectId: selectedProjectId };
      setCustomFieldDefinitions(defs => [...defs, newDef]);
    }
  };
  const handleDeleteCustomFieldDefinition = (id: string) => { setItemToDelete({ id, type: 'customField' }); setIsConfirmModalOpen(true); };

  // Prompt Handlers (Foundry)
  const handleCreatePrompt = () => {
    const newPrompt: Prompt = {
        id: crypto.randomUUID(),
        name: 'New Untitled Prompt',
        description: '',
        promptText: 'Your prompt text with {{variables}} here.',
        contextVariableName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    setPrompts(prev => [newPrompt, ...prev]);
    setSelectedPromptId(newPrompt.id);
  };

  const handleSavePrompt = (promptData: Omit<Prompt, 'createdAt' | 'updatedAt'>) => {
    setPrompts(prev => prev.map(p => p.id === promptData.id ? { ...p, ...promptData, updatedAt: new Date() } : p));
  };
  
  const handleDeletePrompt = (id: string) => { setItemToDelete({ id, type: 'prompt' }); setIsConfirmModalOpen(true); };

  // "Model Hub" Service (Client-Side Implementation)
  const handleRunPrompt = async (promptText: string, variables: { [key: string]: string }): Promise<string> => {
      if (!process.env.API_KEY) {
        return "ERROR: API_KEY environment variable not set. Please configure it to use the Foundry.";
      }

      let populatedPrompt = promptText;
      for (const key in variables) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          populatedPrompt = populatedPrompt.replace(regex, variables[key]);
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: populatedPrompt,
        });
        return response.text;
      } catch (error) {
          console.error("Error calling Gemini API:", error);
          if (error instanceof Error) {
              return `API Error: ${error.message}`;
          }
          return "An unknown error occurred while contacting the AI model.";
      }
  };
  
  // New handler for in-document prompt execution
  const handleExecutePromptInDoc = async (docId: string, promptId: string): Promise<string> => {
    const doc = docs.find(d => d.id === docId);
    const prompt = prompts.find(p => p.id === promptId);

    if (!doc || !prompt) {
        return "Error: Could not find the specified document or prompt.";
    }
    if (!prompt.contextVariableName) {
        return `Error: The prompt "${prompt.name}" is not configured for in-document execution. Please set a context variable in the Foundry.`;
    }

    const docText = tiptapJsonToText(doc.content).trim();
    if (!docText) {
        return "Error: The document is empty. Please add some content to use as context.";
    }

    const variables = { [prompt.contextVariableName]: docText };
    return handleRunPrompt(prompt.promptText, variables);
  };
  
    // FIX: Add handlers for whiteboard AI conversion
    const handleOpenAIConversionModal = async (elementIds: string[]) => {
        const activeWhiteboard = whiteboards.find(w => w.id === activeWhiteboardId);
        if (!activeWhiteboard) return;

        const elementsToConvert = activeWhiteboard.elements.filter(el => elementIds.includes(el.id) && (el as any).text.trim() !== '');
        if (elementsToConvert.length === 0) return;

        setIsAIConversionModalOpen(true);
        setAiConversionIsLoading(true);
        setAiConversionError(null);
        setProposedTasks([]);

        try {
            if (!aiRef.current) throw new Error("AI client not initialized.");

            const notesText = elementsToConvert
                .map(el => (el as any).text)
                .map(text => `- ${text}`)
                .join('\n');

            const prompt = `
Based on the following brainstormed sticky notes, please generate a structured list of actionable tasks. For each task, provide a concise "title" and a one-sentence "description". If a note is not actionable, ignore it.

Notes:
${notesText}
`;
            const generateContentWithRetry = async (retries = 1): Promise<any> => {
                try {
                    return await aiRef.current!.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: {
                            responseMimeType: 'application/json',
                            responseSchema: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                    },
                                    required: ["title", "description"],
                                },
                            },
                        },
                    });
                } catch (error) {
                    console.warn(`Gemini API call failed. Retries left: ${retries}`, error);
                    if (retries > 0) {
                        await new Promise(res => setTimeout(res, 500));
                        return generateContentWithRetry(retries - 1);
                    }
                    throw error;
                }
            };

            const response = await generateContentWithRetry(1);

            const jsonText = response.text.trim();
            const parsedTasks = JSON.parse(jsonText);
            setProposedTasks(parsedTasks);
        } catch (error) {
            console.error("Error converting whiteboard notes to tasks:", error);
            setAiConversionError(error instanceof Error ? error.message : "An unknown error occurred during AI processing. The model may have returned an invalid format.");
        } finally {
            setAiConversionIsLoading(false);
        }
    };
    
    const handleConfirmTaskCreation = (tasksToCreate: {title: string, description: string}[]) => {
        if (!selectedProjectId) return;
        const newTasks: Task[] = tasksToCreate.map(pt => ({
            id: crypto.randomUUID(),
            projectId: selectedProjectId,
            parentTaskId: null,
            title: pt.title,
            description: pt.description,
            status: Status.Todo,
            startDate: null,
            dueDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        setTasks(prev => [...prev, ...newTasks]);
    };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    chatSessionRef.current = null; // Reset chat on close
  };

  // Intelligence Layer: Global Search Handler
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
        setIsSearching(false);
        setSearchResults([]);
        setSynthesizedAnswer('');
        return;
    }

    setIsSearching(true);
    setSynthesizedAnswer('');
    setSearchResults([]);

    const currentRequestId = ++searchRequestController.current;

    // 1. Client-side search and ranking
    const allItems: SearchableEntity[] = [
        ...tasks.map(t => ({ ...t, entityType: 'task' as const, title: t.title })),
        ...docs.map(d => ({ ...d, entityType: 'doc' as const, title: d.title })),
        ...whiteboards.map(w => ({ ...w, entityType: 'whiteboard' as const, title: w.title, description: `Whiteboard with ${w.elements.length} elements.` })),
        ...projects.map(p => ({ ...p, entityType: 'project' as const, title: p.name })),
    ];
    
    const lowerQuery = query.toLowerCase();
    const rankedResults = allItems.map(item => {
        let score = 0;
        const content = item.entityType === 'doc' ? tiptapJsonToText(item.content) : item.description;

        if (item.title?.toLowerCase().includes(lowerQuery)) score += 10;
        if (content?.toLowerCase().includes(lowerQuery)) score += 5;
        
        return { item, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score);

    const topResults = rankedResults.slice(0, 7).map(r => r.item);
    
    if (currentRequestId !== searchRequestController.current) return;
    setSearchResults(topResults);

    if (topResults.length === 0) {
        setIsSearching(false);
        setSynthesizedAnswer("I couldn't find any results matching your query.");
        return;
    }

    // 2. Prepare context with clearer labels and stricter truncation
    const context = topResults.map(item => {
        let details = `Type: ${item.entityType}\nTitle: ${item.title}\n`;
        let content = '';
        let contentLabel = 'Content';

        if (item.entityType === 'task') {
            content = item.description || '';
            contentLabel = 'Description';
            details += `Status: ${item.status}\n`;
            if (item.startDate) details += `Start Date: ${item.startDate.toLocaleDateString()}\n`;
            if (item.dueDate) details += `Due Date: ${item.dueDate.toLocaleDateString()}\n`;
        } else if (item.entityType === 'project') {
            content = item.description || '';
            contentLabel = 'Description';
        } else if (item.entityType === 'doc') {
            content = tiptapJsonToText(item.content) || '';
            contentLabel = 'Content Summary';
        } else if (item.entityType === 'whiteboard') {
            content = item.description || '';
            contentLabel = 'Description';
        }

        const truncatedContent = content.length > 400 ? content.substring(0, 400) + '...' : content;
        details += `${contentLabel}: ${truncatedContent || 'N/A'}\n`;
        return details;
    }).join('---\n');
    
    // 3. Improved prompt for Gemini
    const message = `
Analyze the following search results in the context of the user's query and provide a summary.

User Query: "${query}"

Search Results:
${context}

Based *only* on the information provided in the search results, answer the user's query. If the results don't contain a direct answer, summarize the most relevant findings. Do not invent information. Format your response in markdown.
`;

    // 4. Call Gemini for synthesis using a persistent Chat session
    try {
        if (!aiRef.current) {
            throw new Error("AI client not initialized. Make sure API_KEY is set.");
        }

        if (!chatSessionRef.current) {
             chatSessionRef.current = aiRef.current.chats.create({
              model: 'gemini-2.5-flash',
              config: {
                systemInstruction: 'You are an AI assistant in a project management tool called Weaver. Your goal is to help the user understand their search results. Analyze the user\'s query and the provided search results context to provide a concise, natural language answer. If the context doesn\'t answer the query, summarize what was found. Respond in markdown.',
              }
            });
        }
        
        const sendMessageWithRetry = async (retries = 1): Promise<any> => {
            try {
                return await chatSessionRef.current!.sendMessageStream({ message });
            } catch (error) {
                console.warn(`Gemini API call failed. Retries left: ${retries}`, error);
                if (retries > 0) {
                    await new Promise(res => setTimeout(res, 500)); 
                    return sendMessageWithRetry(retries - 1);
                }
                throw error;
            }
        };

        const responseStream = await sendMessageWithRetry(1);

        let fullText = '';
        for await (const chunk of responseStream) {
            if (currentRequestId !== searchRequestController.current) {
                return;
            }
            fullText += chunk.text;
            setSynthesizedAnswer(fullText);
        }
    } catch (error: any) {
        if (currentRequestId !== searchRequestController.current) {
            return;
        }
        console.error("Error calling Gemini for search synthesis:", error);
        let errorMessage = "Sorry, I encountered an error trying to summarize the results.";
        const errorString = error.toString();
        if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
            errorMessage = "The AI is a bit busy right now. Please try again in a moment.";
        }
        setSynthesizedAnswer(errorMessage);
    } finally {
        if (currentRequestId === searchRequestController.current) {
            setIsSearching(false);
        }
    }
  }, [tasks, docs, projects, whiteboards]);
  
  const handleAcceptSuggestion = (suggestionId: string) => {
    setSuggestions(sugs => sugs.map(s => s.id === suggestionId ? {...s, status: SuggestionStatus.Accepted} : s));
    
    // Example of applying the suggestion
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion?.type === SuggestionType.DeadlineAdjustment) {
        setTasks(ts => ts.map(t => t.id === suggestion.targetEntityId ? {...t, dueDate: new Date(suggestion.suggestion.details.newDueDate)} : t));
    }
  };

  const handleRejectSuggestion = (suggestionId: string) => {
      setSuggestions(sugs => sugs.map(s => s.id === suggestionId ? {...s, status: SuggestionStatus.Rejected} : s));
  };


  // Deletion Confirmation Handlers
  const closeConfirmModal = () => { setIsConfirmModalOpen(false); setItemToDelete(null); };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;

    if (type === 'space') {
        const projectsInSpace = projects.filter(p => p.spaceId === id).map(p => p.id);
        const tasksInSpace = tasks.filter(t => projectsInSpace.includes(t.projectId)).map(t => t.id);
        
        setDocs(prev => prev.filter(d => !projectsInSpace.includes(d.projectId)));
        setCustomFieldValues(prev => prev.filter(v => !tasksInSpace.includes(v.taskId)));
        setCustomFieldDefinitions(prev => prev.filter(d => !projectsInSpace.includes(d.projectId)));
        setTasks(prev => prev.filter(t => !projectsInSpace.includes(t.projectId)));
        setProjects(prev => prev.filter(p => p.spaceId !== id));
        setSpaces(prev => prev.filter(s => s.id !== id));
        if (selectedProject?.spaceId === id) setSelectedProjectId(null);
    } else if (type === 'project') {
      const projectTasks = tasks.filter(t => t.projectId === id).map(t => t.id);
      setDocs(prev => prev.filter(d => d.projectId !== id));
      setCustomFieldValues(prev => prev.filter(v => !projectTasks.includes(v.taskId)));
      setCustomFieldDefinitions(prev => prev.filter(d => d.projectId !== id));
      setVisibleTableColumns(cols => cols.filter(c => !customFieldDefinitions.find(d => d.projectId === id && d.id === c)))
      setTasks(prev => prev.filter(t => t.projectId !== id));
      
      const remainingProjects = projects.filter(p => p.id !== id);
      setProjects(remainingProjects);
      if (selectedProjectId === id) {
          const newSelectedId = remainingProjects.length > 0 ? remainingProjects[0].id : null;
          setSelectedProjectId(newSelectedId);
          if (newSelectedId) {
            handleSelectProject(newSelectedId);
          }
      }
    } else if (type === 'task') {
        let idsToDelete = new Set<string>([id]);
        let queue = [id];
        while (queue.length > 0) {
            const parentId = queue.shift();
            tasks.forEach(task => {
                if (task.parentTaskId === parentId) {
                    idsToDelete.add(task.id);
                    queue.push(task.id);
                }
            });
        }
      setCustomFieldValues(prev => prev.filter(v => !idsToDelete.has(v.taskId)));
      setTasks(tasks.filter((task) => !idsToDelete.has(task.id)));
    } else if (type === 'doc') {
        const docToDelete = docs.find(d => d.id === id);
        if (docToDelete) {
            setDocs(docs.filter(d => d.id !== id));
            if (activeDocId === id) {
                handleSelectProject(docToDelete.projectId);
            }
        }
    } else if (type === 'customField') {
        setCustomFieldValues(prev => prev.filter(v => v.fieldDefinitionId !== id));
        setCustomFieldDefinitions(prev => prev.filter(d => d.id !== id));
        setVisibleTableColumns(cols => cols.filter(c => c !== id));
    } else if (type === 'prompt') {
        setPrompts(prev => prev.filter(p => p.id !== id));
        if (selectedPromptId === id) {
            setSelectedPromptId(prompts.length > 1 ? prompts.filter(p => p.id !== id)[0].id : null);
        }
        // FIX: Add delete logic for whiteboards
    } else if (type === 'whiteboard') {
        const wbToDelete = whiteboards.find(w => w.id === id);
        if (wbToDelete) {
            setWhiteboards(whiteboards.filter(w => w.id !== id));
            if (activeWhiteboardId === id) {
                handleSelectProject(wbToDelete.projectId);
            }
        }
    }

    closeConfirmModal();
  };

  const getConfirmModalContent = () => {
    if (!itemToDelete) return { title: '', message: '' };
    const { id, type } = itemToDelete;

    if (type === 'space') {
      const space = spaces.find(s => s.id === id);
      return { title: 'Delete Space?', message: `Are you sure you want to delete the space "${space?.name}"? All projects, tasks, and documents within this space will be permanently removed.` };
    }
    if (type === 'project') {
      const project = projects.find(p => p.id === id);
      return { title: 'Delete Project?', message: `Are you sure you want to delete the project "${project?.name}"? All associated tasks, documents, and custom fields will also be permanently removed.` };
    }
    if (type === 'task') {
      const task = tasks.find(t => t.id === id);
      const subtaskCount = tasks.filter(t => t.parentTaskId === id).length;
      return { title: 'Delete Task?', message: `Are you sure you want to delete the task "${task?.title}"? ${subtaskCount > 0 ? `All ${subtaskCount} of its subtasks will also be deleted.` : ''} This action cannot be undone.` };
    }
    if (type === 'doc') {
        const doc = docs.find(d => d.id === id);
        return { title: 'Delete Document?', message: `Are you sure you want to delete the document "${doc?.title}"? This action cannot be undone.` };
    }
    if (type === 'customField') {
        const def = customFieldDefinitions.find(d => d.id === id);
        return { title: 'Delete Custom Field?', message: `Are you sure you want to delete the custom field "${def?.name}"? All values associated with this field will be permanently removed.` };
    }
    if (type === 'prompt') {
      const prompt = prompts.find(p => p.id === id);
      return { title: 'Delete Prompt?', message: `Are you sure you want to delete the prompt "${prompt?.name}"? This action cannot be undone.` };
    }
    // FIX: Add confirm modal content for whiteboards
    if (type === 'whiteboard') {
        const wb = whiteboards.find(w => w.id === id);
        return { title: 'Delete Whiteboard?', message: `Are you sure you want to delete the whiteboard "${wb?.title}"? This action cannot be undone.` };
    }
    return { title: '', message: '' };
  };

  const handleSelectSearchResult = (item: SearchableEntity) => {
    setIsSearchModalOpen(false);
    setActiveMainView('workspace');

    switch (item.entityType) {
        case 'project':
            handleSelectProject(item.id);
            break;
        case 'doc':
            handleSelectDoc(item.id);
            break;
        case 'task':
            const taskToOpen = tasks.find(t => t.id === item.id);
            if (taskToOpen) {
                setSelectedProjectId(taskToOpen.projectId);
                setActiveContentType('tasks');
                setActiveView('table');
                handleOpenEditTaskModal(taskToOpen);
            }
            break;
        // FIX: Add search result selection logic for whiteboards
        case 'whiteboard':
            handleSelectWhiteboard(item.id);
            break;
    }
  };

  const renderWorkspaceView = () => {
    if (!selectedProject) {
      return (
        <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">No Project Selected</h2>
            <p className="mt-2 text-gray-400">Select a project from the sidebar, or create a new one to get started.</p>
          </div>
        </main>
      );
    }
    
    if (activeContentType === 'doc') {
        if (activeDoc) {
            return (
                 <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex flex-col gap-6 overflow-hidden">
                    <DocEditor 
                        doc={activeDoc} 
                        prompts={prompts.filter(p => p.contextVariableName)}
                        onSave={handleSaveDoc}
                        onDelete={handleDeleteDoc}
                        onExecutePrompt={handleExecutePromptInDoc}
                    />
                 </main>
            )
        }
        return null;
    }
    // FIX: Add rendering logic for WhiteboardView
    if (activeContentType === 'whiteboard') {
        const activeWhiteboard = whiteboards.find(w => w.id === activeWhiteboardId);
        if (activeWhiteboard) {
            return (
                 <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex flex-col gap-6 overflow-hidden">
                    <WhiteboardView
                        whiteboard={activeWhiteboard}
                        onSave={handleSaveWhiteboard}
                        onConvertToTasks={handleOpenAIConversionModal}
                    />
                 </main>
            )
        }
        return null;
    }


    return (
      <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex flex-col gap-6 overflow-hidden">
        {/* Project Header */}
        <header className="flex-shrink-0">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-sm text-gray-400">{selectedSpace?.name} /</div>
                    <h1 className="text-3xl font-bold text-white">{selectedProject.name}</h1>
                </div>
                 <div className="flex items-center space-x-2">
                    <GlobalSearchBar onClick={() => setIsSearchModalOpen(true)} />
                    <button onClick={() => setIsProjectSettingsModalOpen(true)} className="p-2 rounded-md hover:bg-gray-700 transition-colors"><Cog6ToothIcon /></button>
                </div>
            </div>

            {/* View switcher */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center bg-gray-800/50 p-1 rounded-lg">
                    <button onClick={() => setActiveView('table')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${activeView === 'table' ? 'bg-indigo-600' : ''}`}><TableCellsIcon /> Table</button>
                    <button onClick={() => setActiveView('kanban')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${activeView === 'kanban' ? 'bg-indigo-600' : ''}`}><ViewColumnsIcon /> Board</button>
                    <button onClick={() => setActiveView('timeline')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${activeView === 'timeline' ? 'bg-indigo-600' : ''}`}><ChartBarIcon /> Timeline</button>
                    <button onClick={() => setActiveView('calendar')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${activeView === 'calendar' ? 'bg-indigo-600' : ''}`}><CalendarDaysIcon /> Calendar</button>
                    <button onClick={() => setActiveView('mindmap')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${activeView === 'mindmap' ? 'bg-indigo-600' : ''}`}><ShareIcon /> Mind Map</button>
                    <button onClick={() => setActiveView('graph')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${activeView === 'graph' ? 'bg-indigo-600' : ''}`}><ChartPieIcon /> Graph</button>
                </div>
                
                 <div className="relative" ref={createMenuRef}>
                    <button
                        onClick={() => setIsCreateMenuOpen(prev => !prev)}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                        <PlusIcon />
                        <span>Create</span>
                    </button>
                    {isCreateMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                            <button onClick={() => { handleOpenCreateTaskModal(); setIsCreateMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"><TableCellsIcon /> New Task</button>
                            <button onClick={() => { if(selectedProjectId) { handleCreateDoc(selectedProjectId); setIsCreateMenuOpen(false);} }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"><DocumentTextIcon /> New Document</button>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Content View */}
        {activeView === 'table' && <TaskTable tasks={flattenedSortedTasks} onEdit={handleOpenEditTaskModal} onDelete={handleDeleteTask} onAddSubtask={handleOpenCreateSubtaskModal} requestSort={requestSort} sortConfig={sortConfig} customFieldDefinitions={customFieldDefinitionsForProject} customFieldValuesMap={customFieldValuesMap} visibleColumns={visibleTableColumns} onToggleColumn={(key) => setVisibleTableColumns(cols => cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key])}/>}
        {activeView === 'kanban' && <KanbanView tasks={rootTasksForKanban} onUpdateTaskStatus={handleUpdateTaskStatus} customFieldDefinitions={customFieldDefinitionsForProject} customFieldValues={customFieldValues} predictions={predictions} />}
        {activeView === 'timeline' && <TimelineView tasks={tasksForSelectedProject} />}
        {activeView === 'calendar' && <CalendarView tasks={tasksForSelectedProject} />}
        {activeView === 'mindmap' && <MindMapView project={selectedProject} onSave={(id, data) => setProjects(ps => ps.map(p => p.id === id ? {...p, mindMapData: data} : p))} onConvertToTasks={() => {}} />}
        {activeView === 'graph' && <GraphView data={graphDataForSelectedProject} />}

      </main>
    );
  };
  
  const renderInsightsView = () => {
    const allInsights: Insight[] = [
        ...predictions.map(p => ({ ...p, insightType: 'prediction' as const })),
        ...suggestions.map(s => ({ ...s, insightType: 'suggestion' as const })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex flex-col gap-6 overflow-hidden">
            <InsightsDashboard
                insights={allInsights}
                tasks={tasks}
                projects={projects}
                onAcceptSuggestion={handleAcceptSuggestion}
                onRejectSuggestion={handleRejectSuggestion}
            />
        </main>
    );
};

  const renderMainView = () => {
    switch (activeMainView) {
        case 'foundry':
            return (
                <FoundryView
                    prompts={prompts}
                    selectedPrompt={selectedPrompt}
                    onSelectPrompt={setSelectedPromptId}
                    onCreatePrompt={handleCreatePrompt}
                    onSavePrompt={handleSavePrompt}
                    onDeletePrompt={handleDeletePrompt}
                    onRunPrompt={handleRunPrompt}
                />
            );
        case 'orchestrator':
             return (
                <OrchestratorView
                    workflows={workflows}
                    workflowRuns={workflowRuns}
                    stepExecutions={stepExecutions}
                    prompts={prompts}
                    projects={projects}
                    onCreateWorkflow={() => {
                      const newWorkflow: Workflow = {
                        id: crypto.randomUUID(),
                        name: 'New Untitled Agent',
                        isActive: false,
                        definition: { nodes: [], edges: [] },
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      };
                      setWorkflows(prev => [newWorkflow, ...prev]);
                      return newWorkflow.id;
                    }}
                    onSaveWorkflow={(id, name, def) => {
                      setWorkflows(wfs => wfs.map(w => w.id === id ? {...w, name, definition: def, updatedAt: new Date()} : w));
                    }}
                />
            );
        case 'insights':
            return renderInsightsView();
        case 'workspace':
        default:
            return renderWorkspaceView();
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100 flex p-4 gap-4 font-sans">
      <div className="w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0">
        {/* FIX: Pass missing whiteboard props to NavigationSidebar */}
        <NavigationSidebar
          spaces={spaces}
          projects={projects}
          docs={docs}
          whiteboards={whiteboards}
          selectedProjectId={selectedProjectId}
          activeContentType={activeContentType}
          activeDocId={activeDocId}
          activeWhiteboardId={activeWhiteboardId}
          activeMainView={activeMainView}
          onSelectProject={handleSelectProject}
          onSelectDoc={handleSelectDoc}
          onSelectWhiteboard={handleSelectWhiteboard}
          onSetActiveMainView={setActiveMainView}
          onCreateSpace={handleOpenCreateSpaceModal}
          onEditSpace={handleOpenEditSpaceModal}
          onDeleteSpace={handleDeleteSpace}
          onCreateProject={handleOpenCreateProjectModal}
          onEditProject={handleOpenEditProjectModal}
          onDeleteProject={handleDeleteProject}
          onCreateDoc={handleCreateDoc}
          onDeleteDoc={handleDeleteDoc}
          onCreateWhiteboard={handleCreateWhiteboard}
          onDeleteWhiteboard={handleDeleteWhiteboard}
        />
      </div>

      {renderMainView()}
      
      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        customFieldDefinitions={customFieldDefinitionsForProject}
        initialCustomFieldValues={
          taskToEdit
            ? customFieldDefinitionsForProject.reduce((acc, def) => {
                acc[def.id] = customFieldValuesMap.get(`${taskToEdit?.id}-${def.id}`) ?? '';
                return acc;
            }, {} as {[key: string]: any})
            : {}
        }
        taskPrediction={taskToEdit ? predictions.find(p => p.entityId === taskToEdit.id && p.type === PredictionType.CompletionDate) : undefined}
      />
      <ProjectFormModal 
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />
      <SpaceFormModal
        isOpen={isSpaceModalOpen}
        onClose={handleCloseSpaceModal}
        onSave={handleSaveSpace}
        spaceToEdit={spaceToEdit}
      />
       <ProjectSettingsModal 
        isOpen={isProjectSettingsModalOpen}
        onClose={() => setIsProjectSettingsModalOpen(false)}
        project={selectedProject}
        customFieldDefinitions={customFieldDefinitionsForProject}
        onSaveDefinition={handleSaveCustomFieldDefinition}
        onDeleteDefinition={handleDeleteCustomFieldDefinition}
       />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        title={getConfirmModalContent().title}
        message={getConfirmModalContent().message}
      />
      <SearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
        onSearch={handleSearch}
        isSearching={isSearching}
        synthesizedAnswer={synthesizedAnswer}
        results={searchResults}
        onResultClick={handleSelectSearchResult}
      />
      {/* FIX: Add AIConversionModal to the DOM */}
      <AIConversionModal
        isOpen={isAIConversionModalOpen}
        isLoading={aiConversionIsLoading}
        error={aiConversionError}
        proposedTasks={proposedTasks}
        onClose={() => setIsAIConversionModalOpen(false)}
        onConfirm={handleConfirmTaskCreation}
      />

    </div>
  );
};

export default App;

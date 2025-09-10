export enum Status {
  Todo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export interface Space {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  spaceId: string;
  name: string;
  description: string;
  mindMapData?: any;
  health?: {
    level: 'green' | 'yellow' | 'red';
    reason: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  title: string;
  description: string;
  status: Status;
  startDate: Date | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Type for sortable keys of a Task
export type TaskSortKey = keyof Omit<Task, 'projectId' | 'parentTaskId'>;

// Custom Fields
export enum CustomFieldType {
  Text = 'Text',
  Number = 'Number',
  Date = 'Date',
  Select = 'Select',
}

export interface CustomFieldDefinition {
  id: string;
  projectId: string;
  name: string;
  type: CustomFieldType;
  options?: string[]; // For 'Select' type
}

export interface CustomFieldValue {
  id:string;
  taskId: string;
  fieldDefinitionId: string;
  value: any; // Can be string, number, or Date
}

export interface Doc {
  id: string;
  projectId: string;
  title: string;
  content: any; // Changed from string to any for structured JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  promptText: string;
  contextVariableName?: string | null; // New field for slash command context
  createdAt: Date;
  updatedAt: Date;
}

// --- Whiteboard Types ---

export enum WhiteboardElementType {
  StickyNote = 'sticky-note',
}

export interface BaseWhiteboardElement {
  id: string;
  type: WhiteboardElementType;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
}

export interface StickyNoteElement extends BaseWhiteboardElement {
  type: WhiteboardElementType.StickyNote;
  text: string;
  color: string;
}

export type WhiteboardElement = StickyNoteElement; // Union for more types later

export interface Whiteboard {
  id: string;
  projectId: string;
  title: string;
  elements: WhiteboardElement[];
  createdAt: Date;
  updatedAt: Date;
}


// --- Orchestrator Types ---

export enum NodeType {
  TriggerSchedule = 'trigger-schedule',
  LogicIf = 'logic-if',
  ActionPrompt = 'action-prompt',
  ToolHttpRequest = 'tool-http-request',
  ToolCreateTask = 'tool-create-task',
  IntegrationGitHubCreateIssue = 'integration-github-create-issue',
  IntegrationSalesforceFindRecord = 'integration-salesforce-find-record',
}

export interface BaseNodeData {
  label: string;
}

export interface ScheduleNodeData extends BaseNodeData {
  interval: 'hour' | 'day' | 'week';
  time: string; // e.g., "09:00"
}

export interface ConditionNodeData extends BaseNodeData {
  variable: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt';
  value: string;
}

export interface PromptNodeData extends BaseNodeData {
  promptId: string | null;
  variableMappings: { [key: string]: string };
}

export interface HttpRequestNodeData extends BaseNodeData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: { [key: string]: string };
  body: string; // Raw JSON/text
}

export interface CreateTaskNodeData extends BaseNodeData {
  projectId: string | null;
  title: string;
  description: string;
}

export interface GitHubCreateIssueNodeData extends BaseNodeData {
    repository: string; // e.g., "owner/repo"
    title: string;
    body: string;
}

export interface SalesforceFindRecordNodeData extends BaseNodeData {
    objectType: string;
    query: string; // Simplified SOQL WHERE clause
}


export type NodeData = ScheduleNodeData | ConditionNodeData | PromptNodeData | HttpRequestNodeData | CreateTaskNodeData | GitHubCreateIssueNodeData | SalesforceFindRecordNodeData;

export interface Node<T = NodeData> {
  id: string;
  type: NodeType;
  position: { x: number, y: number };
  data: T;
}

export interface Edge {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
}

export interface WorkflowDefinition {
  nodes: Node[];
  edges: Edge[];
}

export interface Workflow {
  id: string;
  name: string;
  isActive: boolean;
  definition: WorkflowDefinition;
  createdAt: Date;
  updatedAt: Date;
}

// --- Orchestrator Run Types ---

export enum WorkflowRunStatus {
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Running = 'Running',
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string; // Denormalized for easy display
  status: WorkflowRunStatus;
  startedAt: Date;
  endedAt: Date | null;
}

export enum StepExecutionStatus {
    Succeeded = 'Succeeded',
    Failed = 'Failed',
    Skipped = 'Skipped',
}

export interface StepExecution {
    id: string;
    runId: string;
    nodeId: string; // The ID of the node from the workflow definition
    status: StepExecutionStatus;
    inputData: any;
    outputData: any;
    errorMessage?: string;
    startedAt: Date;
    endedAt: Date;
}

// --- Intelligence Layer: AI Project Manager ---

export enum PredictionType {
    CompletionDate = 'completion_date',
    RiskLevel = 'risk_level',
    Bottleneck = 'bottleneck',
}

export enum RiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
}

export interface Prediction {
    id: string;
    entityType: 'task' | 'project';
    entityId: string;
    type: PredictionType;
    predictedValue: {
        date?: string; // For CompletionDate
        level?: RiskLevel; // For RiskLevel
        isBottleneck?: boolean; // For Bottleneck
    };
    confidenceScore: number; // 0-1
    factors: string[];
    createdAt: Date;
}

export enum SuggestionType {
    Assignment = 'assignment',
    Priority = 'priority',
    DeadlineAdjustment = 'deadline_adjustment',
}

export enum SuggestionStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected',
}

export interface InsightSuggestion {
    id: string;
    type: SuggestionType;
    targetEntityId: string;
    suggestion: {
        message: string;
        details?: any;
    };
    reasoning: string;
    impactScore: number; // 0-1
    status: SuggestionStatus;
    createdAt: Date;
}

// A union type for the dashboard
export type Insight = (Prediction & { insightType: 'prediction' }) | (InsightSuggestion & { insightType: 'suggestion' });


// --- Intelligence Layer Types ---
export type SearchableEntity = 
    | (Task & { entityType: 'task', title: string })
    | (Doc & { entityType: 'doc', title: string })
    | (Whiteboard & { entityType: 'whiteboard', title: string, description: string })
    | (Project & { entityType: 'project', title: string, description: string });
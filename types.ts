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

// --- Orchestrator Types ---

export enum NodeType {
  TriggerSchedule = 'trigger-schedule',
  LogicIf = 'logic-if',
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

export type NodeData = ScheduleNodeData | ConditionNodeData;

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

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Task, Status, TaskSortKey, Project, Space, CustomFieldDefinition, CustomFieldValue, CustomFieldType, Doc } from './types';
import { TaskTable } from './components/TaskTable';
import { TaskFormModal } from './components/TaskFormModal';
import { NavigationSidebar } from './components/NavigationSidebar';
import { ProjectFormModal } from './components/ProjectFormModal';
import { SpaceFormModal } from './components/SpaceFormModal';
import { PlusIcon, TableCellsIcon, ViewColumnsIcon, Cog6ToothIcon, DocumentTextIcon, ChartBarIcon, CalendarDaysIcon } from './components/icons';
import { ConfirmationModal } from './components/ConfirmationModal';
import { KanbanView } from './components/KanbanView';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { DocEditor } from './components/DocEditor';
import { TimelineView } from './components/TimelineView';
import { CalendarView } from './components/CalendarView';


const initialSpaces: Space[] = [
    { id: 'space-1', name: 'Product Development', createdAt: new Date(), updatedAt: new Date() },
    { id: 'space-2', name: 'Marketing', createdAt: new Date(), updatedAt: new Date() },
];

const initialProjects: Project[] = [
  { id: 'proj-1', spaceId: 'space-1', name: 'Weaver App Development', description: 'Core development tasks for the Weaver application.', createdAt: new Date(2023, 10, 1), updatedAt: new Date(2023, 10, 1) },
  { id: 'proj-2', spaceId: 'space-2', name: 'Q1 Marketing', description: 'Marketing campaigns for the first quarter.', createdAt: new Date(2023, 10, 2), updatedAt: new Date(2023, 10, 2) },
  { id: 'proj-3', spaceId: 'space-1', name: 'API Integration', description: 'Integrating third-party APIs.', createdAt: new Date(2023, 10, 5), updatedAt: new Date(2023, 10, 5) },
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

const initialDocs: Doc[] = [
    { id: 'doc-1', projectId: 'proj-1', title: 'Project Charter', content: 'This document outlines the scope, objectives, and participants of the Weaver App Development project.', createdAt: new Date(2023, 10, 1, 8, 0), updatedAt: new Date(2023, 10, 1, 9, 0)},
    { id: 'doc-2', projectId: 'proj-1', title: 'Technical Specification', content: '## Core Technologies\n- React\n- TypeScript\n- TailwindCSS', createdAt: new Date(2023, 10, 2, 14, 0), updatedAt: new Date(2023, 10, 3, 10, 0)},
    { id: 'doc-3', projectId: 'proj-2', title: 'Campaign Brief', content: 'Brief for the Q1 marketing campaign.', createdAt: new Date(2023, 10, 4, 11, 0), updatedAt: new Date(2023, 10, 4, 11, 0)},
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

const App: React.FC = () => {
  // State
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>(initialCustomFieldDefinitions);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>(initialCustomFieldValues);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'kanban' | 'timeline' | 'calendar'>('table');
  const [activeContentType, setActiveContentType] = useState<'tasks' | 'doc'>('tasks');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  
  const [sortConfig, setSortConfig] = useState<{ key: TaskSortKey | null; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
  const [visibleTableColumns, setVisibleTableColumns] = useState<string[]>(['title', 'status', 'startDate', 'dueDate', 'createdAt']);
  
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
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'space' | 'project' | 'task' | 'customField' | 'doc' } | null>(null);
  const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);


  // Effects
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
        setSelectedProjectId(projects[0].id);
        setActiveContentType('tasks');
        setActiveDocId(null);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
            setIsCreateMenuOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [createMenuRef]);

  // Derived State
  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const selectedSpace = useMemo(() => spaces.find(s => s.id === selectedProject?.spaceId), [spaces, selectedProject]);
  const activeDoc = useMemo(() => docs.find(d => d.id === activeDocId), [docs, activeDocId]);
  
  const tasksForSelectedProject = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter(task => task.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

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

  // Navigation Handlers
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveContentType('tasks');
    setActiveDocId(null);
  };
  const handleSelectDoc = (docId: string) => {
    const doc = docs.find(d => d.id === docId);
    if (doc) {
        setSelectedProjectId(doc.projectId);
        setActiveContentType('doc');
        setActiveDocId(docId);
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
      const newProject: Project = { id: crypto.randomUUID(), spaceId: spaceIdForNewProject, ...data, createdAt: new Date(), updatedAt: new Date() };
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
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocs(prev => [...prev, newDoc]);
    handleSelectDoc(newDoc.id);
  };
  const handleSaveDoc = (docId: string, data: { title: string; content: string }) => {
    setDocs(docs => docs.map(d => d.id === docId ? { ...d, ...data, updatedAt: new Date() } : d));
  };
  const handleDeleteDoc = (id: string) => { setItemToDelete({ id, type: 'doc' }); setIsConfirmModalOpen(true); };

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
        return { title: 'Delete Custom Field?', message: `Are you sure you want to delete the field "${def?.name}"? All data entered for this field on all tasks will be lost.` };
    }
    return { title: '', message: '' };
  };

  const handleToggleTableColumn = (key: string) => {
    setVisibleTableColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const renderActiveView = () => {
    switch(activeView) {
      case 'table':
        return <TaskTable 
          tasks={flattenedSortedTasks} 
          onEdit={handleOpenEditTaskModal} 
          onDelete={handleDeleteTask}
          onAddSubtask={handleOpenCreateSubtaskModal}
          requestSort={requestSort}
          sortConfig={sortConfig}
          customFieldDefinitions={customFieldDefinitionsForProject}
          customFieldValuesMap={customFieldValuesMap}
          visibleColumns={visibleTableColumns}
          onToggleColumn={handleToggleTableColumn}
        />;
      case 'kanban':
        return <KanbanView
          tasks={rootTasksForKanban}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          customFieldDefinitions={customFieldDefinitionsForProject}
          customFieldValues={customFieldValues}
        />;
      case 'timeline':
        return <TimelineView tasks={tasksForSelectedProject} />;
      case 'calendar':
        return <CalendarView tasks={tasksForSelectedProject} />;
      default:
        return null;
    }
  }

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col overflow-hidden">
      <header className="p-4 sm:p-6 lg:p-8 border-b border-gray-700/50">
          <h1 className="text-2xl font-bold text-white">Weaver</h1>
          <p className="text-sm text-gray-400">The Cognitive Work OS</p>
      </header>
      
      <div className="flex-grow flex p-4 sm:p-6 lg:p-8 gap-6 overflow-hidden">
        <aside className="w-1/3 lg:w-1/4 xl:w-1/5 flex flex-col">
          <NavigationSidebar
            spaces={spaces}
            projects={projects}
            docs={docs}
            selectedProjectId={selectedProjectId}
            activeContentType={activeContentType}
            activeDocId={activeDocId}
            onSelectProject={handleSelectProject}
            onSelectDoc={handleSelectDoc}
            onCreateSpace={handleOpenCreateSpaceModal}
            onEditSpace={handleOpenEditSpaceModal}
            onDeleteSpace={handleDeleteSpace}
            onCreateProject={handleOpenCreateProjectModal}
            onEditProject={handleOpenEditProjectModal}
            onDeleteProject={handleDeleteProject}
            onCreateDoc={handleCreateDoc}
            onDeleteDoc={handleDeleteDoc}
          />
        </aside>

        <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex flex-col gap-6 overflow-hidden">
          {selectedProject ? (
            activeContentType === 'tasks' ? (
                <>
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-gray-400 text-sm">{selectedSpace?.name || '...'}</h2>
                        <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-white">{selectedProject.name}</h3>
                        <button onClick={() => setIsProjectSettingsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors" aria-label="Project Settings">
                            <Cog6ToothIcon />
                        </button>
                        </div>
                        <p className="text-gray-400 mt-1">{selectedProject.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-800 p-1 rounded-lg">
                          <button onClick={() => setActiveView('table')} className={`p-2 rounded-md text-sm font-medium transition-colors ${activeView === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`} aria-pressed={activeView === 'table'} aria-label="Table View" ><TableCellsIcon /></button>
                          <button onClick={() => setActiveView('kanban')} className={`p-2 rounded-md text-sm font-medium transition-colors ${activeView === 'kanban' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`} aria-pressed={activeView === 'kanban'} aria-label="Kanban View" ><ViewColumnsIcon /></button>
                          <button onClick={() => setActiveView('timeline')} className={`p-2 rounded-md text-sm font-medium transition-colors ${activeView === 'timeline' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`} aria-pressed={activeView === 'timeline'} aria-label="Timeline View" ><ChartBarIcon /></button>
                          <button onClick={() => setActiveView('calendar')} className={`p-2 rounded-md text-sm font-medium transition-colors ${activeView === 'calendar' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`} aria-pressed={activeView === 'calendar'} aria-label="Calendar View" ><CalendarDaysIcon /></button>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsCreateMenuOpen(prev => !prev)}
                                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                disabled={!selectedProject}
                                aria-haspopup="true"
                                aria-expanded={isCreateMenuOpen}
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Create</span>
                            </button>
                            {isCreateMenuOpen && (
                                <div ref={createMenuRef} className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                                    <ul className="p-2 space-y-1">
                                        <li>
                                            <button
                                                onClick={() => { handleOpenCreateTaskModal(); setIsCreateMenuOpen(false); }}
                                                className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                            >
                                                <TableCellsIcon className="w-4 h-4" />
                                                <span>New Task</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => { if (selectedProjectId) { handleCreateDoc(selectedProjectId); } setIsCreateMenuOpen(false); }}
                                                className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                            >
                                                <DocumentTextIcon className="w-4 h-4" />
                                                <span>New Document</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
                {renderActiveView()}
                </>
            ) : activeDoc ? (
                <DocEditor
                    key={activeDoc.id}
                    doc={activeDoc}
                    onSave={handleSaveDoc}
                    onDelete={handleDeleteDoc}
                 />
            ) : null
          ) : (
            <div className="flex-grow flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white">No Project Selected</h2>
                    <p className="text-gray-400 mt-2">Select a project from the sidebar, or create a new one to get started.</p>
                </div>
            </div>
          )}
        </main>
      </div>

      <SpaceFormModal
        isOpen={isSpaceModalOpen}
        onClose={handleCloseSpaceModal}
        onSave={handleSaveSpace}
        spaceToEdit={spaceToEdit}
      />

      <ProjectFormModal 
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        customFieldDefinitions={customFieldDefinitionsForProject}
        initialCustomFieldValues={
          taskToEdit ? 
          customFieldValues.filter(v => v.taskId === taskToEdit.id)
            .reduce((acc, curr) => ({...acc, [curr.fieldDefinitionId]: curr.value }), {})
          : {}
        }
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        title={getConfirmModalContent().title}
        message={getConfirmModalContent().message}
      />

      <ProjectSettingsModal
        isOpen={isProjectSettingsModalOpen}
        onClose={() => setIsProjectSettingsModalOpen(false)}
        project={selectedProject}
        customFieldDefinitions={customFieldDefinitionsForProject}
        onSaveDefinition={handleSaveCustomFieldDefinition}
        onDeleteDefinition={handleDeleteCustomFieldDefinition}
      />
    </div>
  );
};

export default App;

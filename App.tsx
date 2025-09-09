import React, { useState, useMemo, useEffect } from 'react';
import { Task, Status, TaskSortKey, Project, Space } from './types';
import { TaskTable } from './components/TaskTable';
import { TaskFormModal } from './components/TaskFormModal';
import { NavigationSidebar } from './components/NavigationSidebar';
import { ProjectFormModal } from './components/ProjectFormModal';
import { SpaceFormModal } from './components/SpaceFormModal';
import { PlusIcon, TableCellsIcon, ViewColumnsIcon } from './components/icons';
import { ConfirmationModal } from './components/ConfirmationModal';
import { KanbanView } from './components/KanbanView';

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
  { id: '1', projectId: 'proj-1', parentTaskId: null, title: 'Setup project boilerplate', description: 'Initialize React project with TypeScript and Tailwind CSS.', status: Status.Done, createdAt: new Date(2023, 10, 1, 9, 0), updatedAt: new Date(2023, 10, 1, 14, 30) },
  { id: '2', projectId: 'proj-1', parentTaskId: null, title: 'Create Core Entities', description: 'Define data models for Space, Project, Task.', status: Status.Done, createdAt: new Date(2023, 10, 1, 10, 15), updatedAt: new Date(2023, 10, 1, 15, 0) },
  { id: '3', projectId: 'proj-1', parentTaskId: '2', title: 'Define Task type', description: '', status: Status.Done, createdAt: new Date(2023, 10, 1, 11, 0), updatedAt: new Date(2023, 10, 1, 11, 30) },
  { id: '4', projectId: 'proj-1', parentTaskId: '2', title: 'Define Project type', description: '', status: Status.Done, createdAt: new Date(2023, 10, 1, 11, 30), updatedAt: new Date(2023, 10, 1, 12, 0) },
  { id: '5', projectId: 'proj-1', parentTaskId: null, title: 'Develop UI Components', description: 'Build the main UI views and components.', status: Status.InProgress, createdAt: new Date(2023, 10, 2, 11, 0), updatedAt: new Date(2023, 10, 2, 16, 45) },
  { id: '6', projectId: 'proj-1', parentTaskId: '5', title: 'Implement Navigation Sidebar', description: 'With Spaces and Projects.', status: Status.InProgress, createdAt: new Date(2023, 10, 3, 8, 30), updatedAt: new Date(2023, 10, 3, 8, 30) },
  { id: '7', projectId: 'proj-1', parentTaskId: '5', title: 'Implement Kanban View', description: 'With drag-and-drop functionality.', status: Status.Todo, createdAt: new Date(2023, 10, 3, 9, 0), updatedAt: new Date(2023, 10, 3, 9, 0) },
  { id: '8', projectId: 'proj-2', parentTaskId: null, title: 'Draft blog post', description: 'Write a blog post about the new features.', status: Status.Todo, createdAt: new Date(2023, 10, 3, 9, 0), updatedAt: new Date(2023, 10, 3, 9, 0) },
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
    
    // Apply all new data
    Object.assign(mainTask, newData, { updatedAt: new Date() });
    
    const newStatus = mainTask.status;

    if (oldStatus !== newStatus) {
        // --- Parent Propagation ---
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
      
        // --- Subtask Propagation ---
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [sortConfig, setSortConfig] = useState<{ key: TaskSortKey | null; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
  const [activeView, setActiveView] = useState<'table' | 'kanban'>('table');
  
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
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'space' | 'project' | 'task' } | null>(null);


  // Effects
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Derived State
  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const selectedSpace = useMemo(() => spaces.find(s => s.id === selectedProject?.spaceId), [spaces, selectedProject]);
  
  const tasksForSelectedProject = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter(task => task.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

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
      setSelectedProjectId(newProject.id); // Select new project
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

  const handleSaveTask = (taskData: { title: string; description: string; status: Status }) => {
    if (!selectedProjectId) return;
    if (taskToEdit) {
      setTasks(prevTasks => getUpdatedTasksWithPropagation(prevTasks, taskToEdit.id, taskData));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        projectId: selectedProjectId,
        parentTaskId: parentTaskIdForNewTask,
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
    handleCloseTaskModal();
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Status) => {
    setTasks(prevTasks => getUpdatedTasksWithPropagation(prevTasks, taskId, { status: newStatus }));
  };
  
  // Deletion Confirmation Handlers
  const closeConfirmModal = () => { setIsConfirmModalOpen(false); setItemToDelete(null); };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;

    if (type === 'space') {
        const projectsInSpace = projects.filter(p => p.spaceId === id).map(p => p.id);
        setTasks(prevTasks => prevTasks.filter(t => !projectsInSpace.includes(t.projectId)));
        setProjects(prevProjects => prevProjects.filter(p => p.spaceId !== id));
        setSpaces(prevSpaces => prevSpaces.filter(s => s.id !== id));
        if (selectedProject?.spaceId === id) setSelectedProjectId(null);
    } else if (type === 'project') {
      const projectIndex = projects.findIndex(p => p.id === id);
      if (projectIndex < 0) return;
      const remainingProjects = projects.filter(p => p.id !== id);
      setProjects(remainingProjects);
      setTasks(prevTasks => prevTasks.filter(t => t.projectId !== id));

      if (selectedProjectId === id) {
        if (remainingProjects.length > 0) {
          const newIndex = Math.min(projectIndex, remainingProjects.length - 1);
          setSelectedProjectId(remainingProjects[newIndex].id);
        } else {
          setSelectedProjectId(null);
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
      setTasks(tasks.filter((task) => !idsToDelete.has(task.id)));
    }

    closeConfirmModal();
  };

  const getConfirmModalContent = () => {
    if (!itemToDelete) return { title: '', message: '' };
    const { id, type } = itemToDelete;

    if (type === 'space') {
      const space = spaces.find(s => s.id === id);
      return {
        title: 'Delete Space?',
        message: `Are you sure you want to delete the space "${space?.name}"? All projects and tasks within this space will be permanently removed. This action cannot be undone.`
      };
    }
    if (type === 'project') {
      const project = projects.find(p => p.id === id);
      return {
        title: 'Delete Project?',
        message: `Are you sure you want to delete the project "${project?.name}"? All associated tasks will also be permanently removed. This action cannot be undone.`
      };
    }
    if (type === 'task') {
      const task = tasks.find(t => t.id === id);
      const subtaskCount = tasks.filter(t => t.parentTaskId === id).length;
      return {
        title: 'Delete Task?',
        message: `Are you sure you want to delete the task "${task?.title}"? ${subtaskCount > 0 ? `All ${subtaskCount} of its subtasks will also be deleted.` : ''} This action cannot be undone.`
      };
    }
    return { title: '', message: '' };
  };

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
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onCreateSpace={handleOpenCreateSpaceModal}
            onEditSpace={handleOpenEditSpaceModal}
            onDeleteSpace={handleDeleteSpace}
            onCreateProject={handleOpenCreateProjectModal}
            onEditProject={handleOpenEditProjectModal}
            onDeleteProject={handleDeleteProject}
          />
        </aside>

        <main className="w-2/3 lg:w-3/4 xl:w-4/5 flex flex-col gap-6 overflow-hidden">
          {selectedProject ? (
            <>
              <div className="flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-gray-400 text-sm">{selectedSpace?.name || '...'}</h2>
                    <h3 className="text-2xl font-bold text-white">{selectedProject.name}</h3>
                    <p className="text-gray-400 mt-1">{selectedProject.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-800 p-1 rounded-lg">
                      <button onClick={() => setActiveView('table')} className={`p-2 rounded-md text-sm font-medium transition-colors ${activeView === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`} aria-pressed={activeView === 'table'} aria-label="Table View" >
                          <TableCellsIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => setActiveView('kanban')} className={`p-2 rounded-md text-sm font-medium transition-colors ${activeView === 'kanban' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`} aria-pressed={activeView === 'kanban'} aria-label="Kanban View" >
                          <ViewColumnsIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <button onClick={handleOpenCreateTaskModal} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={!selectedProject} >
                      <PlusIcon className="w-5 h-5" />
                      <span>Create Task</span>
                    </button>
                  </div>
                </div>
              </div>
              {activeView === 'table' ? (
                <TaskTable 
                  tasks={flattenedSortedTasks} 
                  onEdit={handleOpenEditTaskModal} 
                  onDelete={handleDeleteTask}
                  onAddSubtask={handleOpenCreateSubtaskModal}
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
              ) : (
                <KanbanView
                  tasks={rootTasksForKanban}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                />
              )}
            </>
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
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        title={getConfirmModalContent().title}
        message={getConfirmModalContent().message}
      />
    </div>
  );
};

export default App;

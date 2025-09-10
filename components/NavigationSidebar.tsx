import React, { useState } from 'react';
import { Project, Space, Doc } from '../types';
import { FolderIcon, PlusIcon, EditIcon, TrashIcon, Squares2X2Icon, ChevronRightIcon, ChevronDownIcon, DocumentTextIcon, TableCellsIcon, BeakerIcon, CpuChipIcon } from './icons';

interface NavigationSidebarProps {
  spaces: Space[];
  projects: Project[];
  docs: Doc[];
  selectedProjectId: string | null;
  activeContentType: 'tasks' | 'doc';
  activeDocId: string | null;
  activeMainView: 'workspace' | 'foundry' | 'orchestrator';
  onSelectProject: (id: string) => void;
  onSelectDoc: (id: string) => void;
  onSetActiveMainView: (view: 'workspace' | 'foundry' | 'orchestrator') => void;
  onCreateSpace: () => void;
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (id: string) => void;
  onCreateProject: (spaceId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onCreateDoc: (projectId: string) => void;
  onDeleteDoc: (id: string) => void;
}

const ProjectItem: React.FC<{
    project: Project;
    docs: Doc[];
    selectedProjectId: string | null;
    activeContentType: 'tasks' | 'doc';
    activeDocId: string | null;
    onSelectProject: (id: string) => void;
    onSelectDoc: (id: string) => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (id: string) => void;
    onCreateDoc: (projectId: string) => void;
    onDeleteDoc: (id: string) => void;
}> = (props) => {
    const { project, docs, selectedProjectId, activeContentType, activeDocId, onSelectProject, onSelectDoc, onEditProject, onDeleteProject, onCreateDoc, onDeleteDoc } = props;
    const isProjectActive = selectedProjectId === project.id;
    
    return (
        <li className="space-y-1">
            <div className={`group flex items-center justify-between w-full p-2 rounded-md text-sm font-medium ${isProjectActive ? 'bg-gray-700/70' : ''}`}>
                <div className="flex items-center space-x-3 truncate">
                    <FolderIcon className="flex-shrink-0" />
                    <span className="truncate">{project.name}</span>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onCreateDoc(project.id); }} className="p-1 rounded hover:bg-gray-600/50" aria-label={`Add document to ${project.name}`}><PlusIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onEditProject(project); }} className="p-1 rounded hover:bg-gray-600/50" aria-label={`Edit ${project.name}`}><EditIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-1 rounded hover:bg-red-500/50" aria-label={`Delete ${project.name}`}><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
            
            <ul className="pl-4 space-y-1">
                {/* Tasks Link */}
                <li>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectProject(project.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectProject(project.id); }}
                        className={`group flex items-center justify-between w-full p-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                            isProjectActive && activeContentType === 'tasks'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center space-x-3 truncate">
                            <TableCellsIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Tasks</span>
                        </div>
                    </div>
                </li>
                {/* Docs List */}
                {docs.map(doc => (
                     <li key={doc.id}>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectDoc(doc.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectDoc(doc.id); }}
                            className={`group flex items-center justify-between w-full p-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                activeDocId === doc.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center space-x-3 truncate">
                                <DocumentTextIcon className="flex-shrink-0" />
                                <span className="truncate">{doc.title}</span>
                            </div>
                             <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }} className="p-1 rounded hover:bg-red-500/50" aria-label={`Delete ${doc.title}`}><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </li>
    );
};


const SpaceItem: React.FC<{
    space: Space,
    children: React.ReactNode,
    onEdit: () => void,
    onDelete: () => void,
    onAddProject: () => void,
}> = ({ space, children, onEdit, onDelete, onAddProject }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <li className="space-y-1">
            <div
                role="button"
                tabIndex={0}
                onClick={() => setIsExpanded(!isExpanded)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpanded(!isExpanded); }}
                className="group flex items-center justify-between w-full p-2 text-sm font-medium text-left text-gray-300 rounded-md hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <div className="flex items-center space-x-3">
                    {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    <span className="truncate">{space.name}</span>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onAddProject(); }} className="p-1 rounded hover:bg-gray-600/50" aria-label={`Add project to ${space.name}`}><PlusIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded hover:bg-gray-600/50" aria-label={`Edit ${space.name}`}><EditIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-red-500/50" aria-label={`Delete ${space.name}`}><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
            {isExpanded && <ul className="pl-4 space-y-1">{children}</ul>}
        </li>
    );
};

export const NavigationSidebar: React.FC<NavigationSidebarProps> = (props) => {
  const { spaces, projects, docs, activeMainView, onSetActiveMainView, ...rest } = props;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
         <div className="flex items-center p-1 rounded-lg bg-gray-900/50">
            <button
              onClick={() => onSetActiveMainView('workspace')}
              className={`flex-1 flex justify-center items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${activeMainView === 'workspace' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              aria-pressed={activeMainView === 'workspace'}
            >
              <Squares2X2Icon className="w-5 h-5" />
              <span>Workspace</span>
            </button>
            <button
              onClick={() => onSetActiveMainView('foundry')}
              className={`flex-1 flex justify-center items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${activeMainView === 'foundry' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              aria-pressed={activeMainView === 'foundry'}
            >
              <BeakerIcon className="w-5 h-5" />
              <span>Foundry</span>
            </button>
            <button
              onClick={() => onSetActiveMainView('orchestrator')}
              className={`flex-1 flex justify-center items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${activeMainView === 'orchestrator' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              aria-pressed={activeMainView === 'orchestrator'}
            >
              <CpuChipIcon className="w-5 h-5" />
              <span>Orchestrator</span>
            </button>
        </div>

        {activeMainView === 'workspace' && (
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">Spaces</h2>
                </div>
                <button
                onClick={props.onCreateSpace}
                className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Create new space"
                >
                <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>
      
      <nav className="flex-grow overflow-y-auto -mr-2 pr-2">
        {activeMainView === 'workspace' && (
            <>
                {spaces.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>No spaces yet. Create one to get started!</p>
                    </div>
                ) : (
                <ul className="space-y-2">
                {spaces.map(space => (
                    <SpaceItem 
                        key={space.id} 
                        space={space}
                        onEdit={() => props.onEditSpace(space)}
                        onDelete={() => props.onDeleteSpace(space.id)}
                        onAddProject={() => props.onCreateProject(space.id)}
                    >
                    {projects.filter(p => p.spaceId === space.id).map(project => (
                        <ProjectItem
                            key={project.id}
                            project={project}
                            docs={docs.filter(d => d.projectId === project.id)}
                            {...rest}
                        />
                    ))}
                    </SpaceItem>
                ))}
                </ul>
                )}
            </>
        )}
      </nav>
    </div>
  );
};

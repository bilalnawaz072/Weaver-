import React, { useState } from 'react';
import { Project, Space } from '../types';
import { FolderIcon, PlusIcon, EditIcon, TrashIcon, Squares2X2Icon, ChevronRightIcon, ChevronDownIcon } from './icons';

interface NavigationSidebarProps {
  spaces: Space[];
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateSpace: () => void;
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (id: string) => void;
  onCreateProject: (spaceId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

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
  const { spaces, projects, selectedProjectId, onSelectProject, onCreateSpace, onEditSpace, onDeleteSpace, onCreateProject, onEditProject, onDeleteProject } = props;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
            <Squares2X2Icon className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-white">Spaces</h2>
        </div>
        <button
          onClick={onCreateSpace}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          aria-label="Create new space"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-grow overflow-y-auto -mr-2 pr-2">
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
                onEdit={() => onEditSpace(space)}
                onDelete={() => onDeleteSpace(space.id)}
                onAddProject={() => onCreateProject(space.id)}
            >
              {projects.filter(p => p.spaceId === space.id).map(project => (
                <li key={project.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectProject(project.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectProject(project.id); }}
                    className={`group flex items-center justify-between w-full p-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      selectedProjectId === project.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                        <FolderIcon className="flex-shrink-0" />
                        <span className="truncate">{project.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); onEditProject(project); }} className="p-1 rounded hover:bg-gray-600/50" aria-label={`Edit ${project.name}`}><EditIcon className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-1 rounded hover:bg-red-500/50" aria-label={`Delete ${project.name}`}><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </SpaceItem>
          ))}
        </ul>
        )}
      </nav>
    </div>
  );
};
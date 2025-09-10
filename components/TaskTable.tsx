import React, { useState, useRef, useEffect } from 'react';
import { Task, Status, TaskSortKey, CustomFieldDefinition, CustomFieldType } from '../types';
import { EditIcon, TrashIcon, ChevronUpDownIcon, PlusIcon, ArrowUturnDownIcon, TableCellsIcon } from './icons';
import { TaskRowCard } from './TaskRowCard';

type TaskWithLevel = Task & { level: number };

const STANDARD_COLUMNS = {
    title: "Title",
    status: "Status",
    startDate: "Start Date",
    dueDate: "Due Date",
    createdAt: "Created At",
    updatedAt: "Updated At",
}

interface TaskTableProps {
  tasks: TaskWithLevel[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentTaskId: string) => void;
  requestSort: (key: TaskSortKey) => void;
  sortConfig?: { key: TaskSortKey | null; direction: 'ascending' | 'descending' };
  customFieldDefinitions: CustomFieldDefinition[];
  customFieldValuesMap: Map<string, any>;
  visibleColumns: string[];
  onToggleColumn: (key: string) => void;
}

const statusColors: { [key in Status]: string } = {
  [Status.Todo]: 'bg-gray-500',
  [Status.InProgress]: 'bg-blue-500',
  [Status.Done]: 'bg-green-500',
};

const ColumnConfigurator: React.FC<{
    standardColumns: { [key: string]: string };
    customFieldDefinitions: CustomFieldDefinition[];
    visibleColumns: string[];
    onToggleColumn: (key: string) => void;
}> = ({ standardColumns, customFieldDefinitions, visibleColumns, onToggleColumn }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors">
                <TableCellsIcon /> <span>Columns</span>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                    <div className="p-2">
                        <h4 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Standard</h4>
                        {Object.entries(standardColumns).map(([key, title]) => (
                            <label key={key} className="flex items-center w-full px-2 py-1.5 text-sm text-gray-200 rounded-md hover:bg-gray-700 cursor-pointer">
                                <input type="checkbox" checked={visibleColumns.includes(key)} onChange={() => onToggleColumn(key)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-indigo-600 focus:ring-indigo-500"/>
                                <span className="ml-2">{title}</span>
                            </label>
                        ))}
                        {customFieldDefinitions.length > 0 && <h4 className="mt-2 px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Custom</h4>}
                        {customFieldDefinitions.map(def => (
                             <label key={def.id} className="flex items-center w-full px-2 py-1.5 text-sm text-gray-200 rounded-md hover:bg-gray-700 cursor-pointer">
                                <input type="checkbox" checked={visibleColumns.includes(def.id)} onChange={() => onToggleColumn(def.id)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-indigo-600 focus:ring-indigo-500"/>
                                <span className="ml-2 truncate">{def.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
};


const SortableHeader: React.FC<{
    sortKey: TaskSortKey;
    title: string;
    requestSort: (key: TaskSortKey) => void;
    sortConfig?: { key: TaskSortKey | null; direction: 'ascending' | 'descending' };
}> = ({ sortKey, title, requestSort, sortConfig }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = isSorted ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : '';

    return (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            <button onClick={() => requestSort(sortKey)} className="flex items-center space-x-1 group">
                <span>{title}</span>
                <span className={`transition-opacity ${isSorted ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>
                    {directionIcon || <ChevronUpDownIcon className="w-4 h-4" />}
                </span>
            </button>
        </th>
    );
};


export const TaskTable: React.FC<TaskTableProps> = (props) => {
  const { tasks, onEdit, onDelete, onAddSubtask, requestSort, sortConfig, customFieldDefinitions, customFieldValuesMap, visibleColumns, onToggleColumn } = props;
  
  const customFieldMap = new Map(customFieldDefinitions.map(def => [def.id, def]));

  const renderCellContent = (task: Task, columnKey: string) => {
    const emptyCell = <span className="text-gray-500 italic">empty</span>;

    switch (columnKey) {
        case 'title':
            return (
                <div className="flex items-center" style={{ paddingLeft: `${(task as TaskWithLevel).level * 2}rem` }}>
                    {(task as TaskWithLevel).level > 0 && <ArrowUturnDownIcon className="mr-2 text-gray-500 flex-shrink-0" />}
                    <div>
                        <div className="text-sm font-medium text-white">{task.title}</div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">{task.description || 'No description'}</div>
                    </div>
                </div>
            );
        case 'status':
            return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]} text-white`}>{task.status}</span>;
        case 'startDate':
            return task.startDate ? task.startDate.toLocaleDateString() : emptyCell;
        case 'dueDate':
            return task.dueDate ? task.dueDate.toLocaleDateString() : emptyCell;
        case 'createdAt':
            return task.createdAt.toLocaleString();
        case 'updatedAt':
            return task.updatedAt.toLocaleString();
        default:
            const fieldDef = customFieldMap.get(columnKey);
            if (!fieldDef) return null;
            const value = customFieldValuesMap.get(`${task.id}-${columnKey}`);
            if (value === null || value === undefined || value === '') return emptyCell;
            if (fieldDef.type === CustomFieldType.Date && value) return new Date(value).toLocaleDateString();
            return String(value);
    }
  };

  const renderEmptyState = () => (
    <div className="px-6 py-16 text-center text-gray-400">
        <div className="text-center">
        <h3 className="text-lg font-semibold text-white">No Tasks Here</h3>
        <p className="mt-1 text-sm text-gray-500">This project doesn't have any tasks yet. Create one to get started!</p>
        </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-700 flex-grow flex flex-col">
       <div className="p-4 bg-gray-800 flex justify-end">
          <ColumnConfigurator 
            standardColumns={STANDARD_COLUMNS}
            customFieldDefinitions={customFieldDefinitions}
            visibleColumns={visibleColumns}
            onToggleColumn={onToggleColumn}
          />
        </div>
      <div className="overflow-y-auto">
        {/* Desktop Table View */}
        <table className="hidden md:table min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {visibleColumns.map(key => {
                  if (STANDARD_COLUMNS[key as keyof typeof STANDARD_COLUMNS]) {
                      return <SortableHeader key={key} sortKey={key as TaskSortKey} title={STANDARD_COLUMNS[key as keyof typeof STANDARD_COLUMNS]} requestSort={requestSort} sortConfig={sortConfig} />;
                  }
                  const fieldDef = customFieldMap.get(key);
                  if (fieldDef) {
                      return <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{fieldDef.name}</th>;
                  }
                  return null;
              })}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1}>
                   {renderEmptyState()}
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-700/50 transition-colors duration-200 group">
                    {visibleColumns.map(key => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {renderCellContent(task, key)}
                        </td>
                    ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                       <button onClick={() => onAddSubtask(task.id)} className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100" aria-label="Add subtask">
                        <PlusIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onEdit(task)} className="text-indigo-400 hover:text-indigo-300 transition-colors" aria-label="Edit task">
                        <EditIcon />
                      </button>
                      <button onClick={() => onDelete(task.id)} className="text-red-500 hover:text-red-400 transition-colors" aria-label="Delete task">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

         {/* Mobile Card View */}
         <div className="block md:hidden">
            {tasks.length === 0 ? renderEmptyState() : (
                 <div className="p-2 space-y-2">
                    {tasks.map(task => (
                        <TaskRowCard 
                            key={task.id}
                            task={task}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSubtask={onAddSubtask}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
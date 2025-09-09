import React from 'react';
import { Task, Status, TaskSortKey } from '../types';
import { EditIcon, TrashIcon, ChevronUpDownIcon, PlusIcon, ArrowUturnDownIcon } from './icons';

type TaskWithLevel = Task & { level: number };

interface TaskTableProps {
  tasks: TaskWithLevel[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentTaskId: string) => void;
  requestSort: (key: TaskSortKey) => void;
  sortConfig?: { key: TaskSortKey | null; direction: 'ascending' | 'descending' };
}

const statusColors: { [key in Status]: string } = {
  [Status.Todo]: 'bg-gray-500',
  [Status.InProgress]: 'bg-blue-500',
  [Status.Done]: 'bg-green-500',
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


export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEdit, onDelete, onAddSubtask, requestSort, sortConfig }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-700 flex-grow flex flex-col">
      <div className="overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <SortableHeader sortKey="title" title="Title" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader sortKey="status" title="Status" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader sortKey="createdAt" title="Created At" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader sortKey="updatedAt" title="Updated At" requestSort={requestSort} sortConfig={sortConfig} />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                   <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">No Tasks Here</h3>
                    <p className="mt-1 text-sm text-gray-500">This project doesn't have any tasks yet. Create one to get started!</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-700/50 transition-colors duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center" style={{ paddingLeft: `${task.level * 2}rem` }}>
                      {task.level > 0 && <ArrowUturnDownIcon className="mr-2 text-gray-500 flex-shrink-0" />}
                      <div>
                        <div className="text-sm font-medium text-white">{task.title}</div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">{task.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]} text-white`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {task.createdAt.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {task.updatedAt.toLocaleString()}
                  </td>
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
      </div>
    </div>
  );
};
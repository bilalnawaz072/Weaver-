import React from 'react';
import { Task, Status } from '../types';
import { PlusIcon, EditIcon, TrashIcon, ArrowUturnDownIcon } from './icons';

type TaskWithLevel = Task & { level: number };

interface TaskRowCardProps {
    task: TaskWithLevel;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onAddSubtask: (parentTaskId: string) => void;
}

const statusPillColors: { [key in Status]: string } = {
  [Status.Todo]: 'bg-gray-600 text-gray-200',
  [Status.InProgress]: 'bg-blue-600 text-blue-100',
  [Status.Done]: 'bg-green-600 text-green-100',
};

export const TaskRowCard: React.FC<TaskRowCardProps> = ({ task, onEdit, onDelete, onAddSubtask }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
             <div className="flex items-start" style={{ paddingLeft: `${task.level * 1}rem` }}>
                {task.level > 0 && <ArrowUturnDownIcon className="mr-2 mt-1 text-gray-500 flex-shrink-0" />}
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-white break-words">{task.title}</p>
                            <p className="text-sm text-gray-400 mt-1 break-words">{task.description || 'No description'}</p>
                        </div>
                         <span className={`flex-shrink-0 ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${statusPillColors[task.status]}`}>
                            {task.status}
                        </span>
                    </div>

                    {(task.startDate || task.dueDate) && (
                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                            <span>🗓️</span>
                            <span>{task.startDate?.toLocaleDateString() ?? '...'}</span>
                            <span>→</span>
                            <span>{task.dueDate?.toLocaleDateString() ?? '...'}</span>
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-3">
                        <button onClick={() => onAddSubtask(task.id)} className="text-gray-400 hover:text-white transition-colors p-1" aria-label="Add subtask">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onEdit(task)} className="text-indigo-400 hover:text-indigo-300 transition-colors p-1" aria-label="Edit task">
                            <EditIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(task.id)} className="text-red-500 hover:text-red-400 transition-colors p-1" aria-label="Delete task">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

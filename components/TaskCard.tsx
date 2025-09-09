import React, { useState } from 'react';
import { Task, Status } from '../types';
import { ArrowUturnDownIcon, ChevronDownIcon, ChevronRightIcon } from './icons';
import { KanbanTask } from './KanbanView';

interface TaskCardProps {
  task: KanbanTask;
}

const statusIndicatorColors: { [key in Status]: string } = {
  [Status.Todo]: 'bg-gray-400',
  [Status.InProgress]: 'bg-blue-400',
  [Status.Done]: 'bg-green-400',
};

const statusPillColors: { [key in Status]: string } = {
  [Status.Todo]: 'bg-gray-600 text-gray-200',
  [Status.InProgress]: 'bg-blue-600 text-blue-100',
  [Status.Done]: 'bg-green-600 text-green-100',
};

const StatusIndicator: React.FC<{ status: Status }> = ({ status }) => (
    <div className={`w-2 h-2 rounded-full mr-2.5 flex-shrink-0 ${statusIndicatorColors[status]}`} />
);

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('taskStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50', 'scale-95', 'border-indigo-500');
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95', 'border-indigo-500');
  };

  const hasSubtasks = task.subtaskCount > 0;
  const isDone = task.status === Status.Done;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-700 cursor-grab active:cursor-grabbing transition-all duration-150 flex flex-col gap-3 ${isDone ? 'opacity-70' : ''}`}
      aria-roledescription={`Draggable task card for ${task.title}`}
    >
        <div>
          <div className="flex justify-between items-start">
              <h4 className={`font-bold text-white break-words pr-2 transition-colors ${isDone ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
              {task.parentTaskId && <ArrowUturnDownIcon className="text-gray-500 flex-shrink-0" />}
          </div>
          <p className={`text-sm text-gray-400 mt-1 break-words transition-colors ${isDone ? 'line-through' : ''}`}>{task.description || 'No description'}</p>
        </div>
        
        <div className="flex items-center">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusPillColors[task.status]}`}>
                {task.status}
            </span>
        </div>
        
        {hasSubtasks && (
          <div className="border-t border-gray-700 pt-3">
            <div 
                className="flex items-center space-x-2 text-xs text-gray-400 cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
                role="button"
                aria-expanded={isExpanded}
            >
                {isExpanded ? <ChevronDownIcon className="w-4 h-4 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />}
                <span className="font-medium group-hover:text-gray-200 transition-colors">{task.completedSubtaskCount} / {task.subtaskCount} Subtasks</span>
                <div className="w-full bg-gray-600 rounded-full h-1.5">
                    <div 
                        className="bg-green-500 h-1.5 rounded-full transition-all" 
                        style={{ width: `${task.subtaskCount > 0 ? (task.completedSubtaskCount / task.subtaskCount) * 100 : 0}%`}}
                    ></div>
                </div>
            </div>

            <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-2' : 'max-h-0'}`}
            >
                <div className="pl-4 pt-2 space-y-2 border-l-2 border-gray-700 ml-[7px]">
                    {task.subtasks.map(subtask => (
                        <div key={subtask.id} className="text-sm text-gray-300 flex items-center">
                            <StatusIndicator status={subtask.status} />
                            <span className={`${subtask.status === Status.Done ? 'line-through text-gray-500' : ''} transition-colors`}>
                                {subtask.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
    </div>
  );
};
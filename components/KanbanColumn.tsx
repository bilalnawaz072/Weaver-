import React, { useState } from 'react';
import { Status } from '../types';
import { TaskCard } from './TaskCard';
import { KanbanTask } from './KanbanView';


interface KanbanColumnProps {
  status: Status;
  tasks: KanbanTask[];
  onDropTask: (taskId: string, newStatus: Status) => void;
}

const statusColors: { [key in Status]: string } = {
  [Status.Todo]: 'border-t-gray-500',
  [Status.InProgress]: 'border-t-blue-500',
  [Status.Done]: 'border-t-green-500',
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onDropTask }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    // Prevent dropping a task in its current column
    const taskStatus = e.dataTransfer.getData('taskStatus');
    if (taskId && status !== taskStatus) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 min-w-[300px] max-w-[350px] bg-gray-900/50 rounded-lg flex flex-col transition-colors duration-300 ${isOver ? 'bg-gray-700/50' : ''}`}
      aria-label={`Kanban column for status ${status}`}
    >
      <div className={`p-4 border-t-4 ${statusColors[status]} rounded-t-lg flex-shrink-0`}>
        <h3 className="font-bold text-lg text-white flex items-center justify-between">
            <span>{status}</span>
            <span className="text-sm font-normal bg-gray-700 text-gray-300 rounded-full px-2 py-0.5">{tasks.length}</span>
        </h3>
      </div>
      <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
        {tasks.length > 0 ? (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="flex-grow flex items-center justify-center text-center text-gray-500 py-4 border-2 border-dashed border-gray-700 rounded-lg">
            <p>Drag tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};
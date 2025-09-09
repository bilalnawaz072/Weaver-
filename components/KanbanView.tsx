import React, { useMemo } from 'react';
import { Task, Status } from '../types';
import { KanbanColumn } from './KanbanColumn';

export interface KanbanTask extends Task {
    subtasks: Task[];
    subtaskCount: number;
    completedSubtaskCount: number;
}

interface KanbanViewProps {
  tasks: KanbanTask[];
  onUpdateTaskStatus: (taskId: string, newStatus: Status) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ tasks, onUpdateTaskStatus }) => {
  const groupedTasks = useMemo(() => {
    const initialGroups: { [key in Status]: KanbanTask[] } = {
      [Status.Todo]: [],
      [Status.InProgress]: [],
      [Status.Done]: [],
    };
    // Ensure tasks are sorted by creation date within columns for consistency
    const sortedTasks = [...tasks].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return sortedTasks.reduce((acc, task) => {
      if (acc[task.status]) {
        acc[task.status].push(task);
      }
      return acc;
    }, initialGroups);
  }, [tasks]);

  return (
    <div className="flex-grow flex gap-6 overflow-x-auto pb-4">
      {(Object.keys(groupedTasks) as Status[]).map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={groupedTasks[status]}
          onDropTask={onUpdateTaskStatus}
        />
      ))}
    </div>
  );
};
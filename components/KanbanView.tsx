import React, { useMemo } from 'react';
import { Task, Status, CustomFieldDefinition, CustomFieldValue, Prediction } from '../types';
import { KanbanColumn } from './KanbanColumn';

export interface KanbanTask extends Task {
    subtasks: Task[];
    subtaskCount: number;
    completedSubtaskCount: number;
}

interface KanbanViewProps {
  tasks: KanbanTask[];
  onUpdateTaskStatus: (taskId: string, newStatus: Status) => void;
  customFieldDefinitions: CustomFieldDefinition[];
  customFieldValues: CustomFieldValue[];
  predictions: Prediction[];
}

export const KanbanView: React.FC<KanbanViewProps> = ({ tasks, onUpdateTaskStatus, customFieldDefinitions, customFieldValues, predictions }) => {
  const customFieldDefinitionMap = useMemo(() => new Map(customFieldDefinitions.map(def => [def.id, def])), [customFieldDefinitions]);

  const tasksWithCustomFields = useMemo(() => {
    return tasks.map(task => {
        const values = customFieldValues
            .filter(val => val.taskId === task.id)
            .map(val => ({
                definition: customFieldDefinitionMap.get(val.fieldDefinitionId),
                value: val.value
            }))
            .filter(item => item.definition && item.value);
        return { ...task, customFields: values };
    });
  }, [tasks, customFieldValues, customFieldDefinitionMap]);

  const groupedTasks = useMemo(() => {
    const initialGroups: { [key in Status]: any[] } = {
      [Status.Todo]: [],
      [Status.InProgress]: [],
      [Status.Done]: [],
    };
    const sortedTasks = [...tasksWithCustomFields].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return sortedTasks.reduce((acc, task) => {
      if (acc[task.status]) {
        acc[task.status].push(task);
      }
      return acc;
    }, initialGroups);
  }, [tasksWithCustomFields]);

  return (
    <div className="flex-grow flex gap-6 overflow-x-auto pb-4">
      {(Object.keys(groupedTasks) as Status[]).map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={groupedTasks[status]}
          onDropTask={onUpdateTaskStatus}
          predictions={predictions}
        />
      ))}
    </div>
  );
};
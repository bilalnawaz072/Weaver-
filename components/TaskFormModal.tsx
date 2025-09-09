import React, { useState, useEffect } from 'react';
import { Task, Status, CustomFieldDefinition, CustomFieldType } from '../types';
import { XMarkIcon } from './icons';

const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    // Adjust for timezone offset before converting to ISO string
    const tempDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return tempDate.toISOString().split('T')[0];
};


interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: { title: string; description: string; status: Status; startDate: Date | null; dueDate: Date | null }, customFieldValues: { [key: string]: any }) => void;
  taskToEdit: Task | null;
  customFieldDefinitions: CustomFieldDefinition[];
  initialCustomFieldValues: { [key: string]: any };
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, taskToEdit, customFieldDefinitions, initialCustomFieldValues }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>(Status.Todo);
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [customFieldValues, setCustomFieldValues] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description);
            setStatus(taskToEdit.status);
            setStartDate(formatDateForInput(taskToEdit.startDate));
            setDueDate(formatDateForInput(taskToEdit.dueDate));
            setCustomFieldValues(initialCustomFieldValues);
        } else {
            setTitle('');
            setDescription('');
            setStatus(Status.Todo);
            setStartDate('');
            setDueDate('');
            setCustomFieldValues({});
        }
        setError('');
    }
  }, [isOpen, taskToEdit, initialCustomFieldValues]);

  if (!isOpen) return null;

  const handleCustomFieldChange = (fieldId: string, value: any, type: CustomFieldType) => {
    let processedValue = value;
    if (type === CustomFieldType.Number) {
        processedValue = value === '' ? null : parseFloat(value);
    }
    setCustomFieldValues(prev => ({...prev, [fieldId]: processedValue }));
  }

  const renderCustomFieldInput = (field: CustomFieldDefinition) => {
    const value = customFieldValues[field.id] || '';
    
    const baseInputClasses = "w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";
    
    switch (field.type) {
        case CustomFieldType.Text:
            return <input type="text" value={value} onChange={e => handleCustomFieldChange(field.id, e.target.value, field.type)} className={baseInputClasses} />;
        case CustomFieldType.Number:
            return <input type="number" value={value === null ? '' : value} onChange={e => handleCustomFieldChange(field.id, e.target.value, field.type)} className={baseInputClasses} />;
        case CustomFieldType.Date:
            const dateValue = value ? new Date(value).toISOString().split('T')[0] : '';
            return <input type="date" value={dateValue} onChange={e => handleCustomFieldChange(field.id, e.target.value, field.type)} className={baseInputClasses} />;
        case CustomFieldType.Select:
            return (
                <select value={value} onChange={e => handleCustomFieldChange(field.id, e.target.value, field.type)} className={`${baseInputClasses} appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                    <option value="">Select...</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        default:
            return null;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    const finalStartDate = startDate ? new Date(startDate) : null;
    const finalDueDate = dueDate ? new Date(dueDate) : null;

    if (finalStartDate && finalDueDate && finalStartDate > finalDueDate) {
      setError('Start date cannot be after the due date.');
      return;
    }

    onSave({ title, description, status, startDate: finalStartDate, dueDate: finalDueDate }, customFieldValues);
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <XMarkIcon />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
        
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g., Design the new dashboard"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Add more details about the task..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                {Object.values(Status).map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
                </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>


          {customFieldDefinitions.length > 0 && <hr className="border-gray-600" />}

          {customFieldDefinitions.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-300 mb-1">{field.name}</label>
              {renderCustomFieldInput(field)}
            </div>
          ))}

          <div className="flex justify-end pt-4 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
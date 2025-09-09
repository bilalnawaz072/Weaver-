import React, { useState, useEffect } from 'react';
import { Project, CustomFieldDefinition, CustomFieldType } from '../types';
import { XMarkIcon, PlusIcon, EditIcon, TrashIcon } from './icons';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  customFieldDefinitions: CustomFieldDefinition[];
  onSaveDefinition: (definition: Omit<CustomFieldDefinition, 'id' | 'projectId'> | CustomFieldDefinition) => void;
  onDeleteDefinition: (id: string) => void;
}

const FieldEditor: React.FC<{
  definition: Omit<CustomFieldDefinition, 'id' | 'projectId'> | CustomFieldDefinition | null;
  onSave: (definition: Omit<CustomFieldDefinition, 'id' | 'projectId'> | CustomFieldDefinition) => void;
  onCancel: () => void;
}> = ({ definition, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomFieldType>(CustomFieldType.Text);
  const [options, setOptions] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(definition?.name || '');
    setType(definition?.type || CustomFieldType.Text);
    setOptions(definition?.options || []);
    setError('');
  }, [definition]);

  const handleAddOption = () => {
    if (currentOption.trim() && !options.includes(currentOption.trim())) {
      setOptions([...options, currentOption.trim()]);
      setCurrentOption('');
    }
  };
  
  const handleRemoveOption = (optionToRemove: string) => {
    setOptions(options.filter(opt => opt !== optionToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Field name cannot be empty.');
      return;
    }
    if (type === CustomFieldType.Select && options.length < 1) {
      setError('Select fields must have at least one option.');
      return;
    }

    const savedDefinition = {
      ...(definition || {}),
      name,
      type,
      options: type === CustomFieldType.Select ? options : undefined,
    };
    onSave(savedDefinition as Omit<CustomFieldDefinition, 'id' | 'projectId'> | CustomFieldDefinition);
  };

  return (
    <div className="bg-gray-700/50 p-6 rounded-lg mt-4 border border-gray-600">
      <h4 className="text-lg font-bold mb-4 text-white">{definition && 'id' in definition ? 'Edit Field' : 'Add New Field'}</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fieldName" className="block text-sm font-medium text-gray-300 mb-1">Field Name</label>
          <input id="fieldName" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" placeholder="e.g., Priority"/>
        </div>
        <div>
          <label htmlFor="fieldType" className="block text-sm font-medium text-gray-300 mb-1">Field Type</label>
          <select id="fieldType" value={type} onChange={e => setType(e.target.value as CustomFieldType)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
            {Object.values(CustomFieldType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {type === CustomFieldType.Select && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Options</label>
            <div className="flex gap-2">
              <input type="text" value={currentOption} onChange={e => setCurrentOption(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" placeholder="Add an option"/>
              <button type="button" onClick={handleAddOption} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Add</button>
            </div>
            <ul className="mt-2 space-y-1">
              {options.map(opt => (
                <li key={opt} className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
                  <span>{opt}</span>
                  <button type="button" onClick={() => handleRemoveOption(opt)} className="text-gray-400 hover:text-white"><XMarkIcon className="w-4 h-4"/></button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save Field</button>
        </div>
      </form>
    </div>
  );
};


export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose, project, customFieldDefinitions, onSaveDefinition, onDeleteDefinition }) => {
  const [editingDefinition, setEditingDefinition] = useState<Omit<CustomFieldDefinition, 'id' | 'projectId'> | CustomFieldDefinition | null>(null);

  useEffect(() => {
    if (!isOpen) {
        setEditingDefinition(null);
    }
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const handleSave = (definition: Omit<CustomFieldDefinition, 'id' | 'projectId'> | CustomFieldDefinition) => {
    onSaveDefinition(definition);
    setEditingDefinition(null);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl relative border border-gray-700" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XMarkIcon /></button>
        <h2 className="text-2xl font-bold mb-2 text-white">Project Settings</h2>
        <p className="text-gray-400 mb-6">Editing settings for <span className="font-semibold text-gray-200">{project.name}</span></p>

        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Custom Fields</h3>
                <button onClick={() => setEditingDefinition({ name: '', type: CustomFieldType.Text })} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
                    <PlusIcon /><span>Add Field</span>
                </button>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                {customFieldDefinitions.length === 0 && !editingDefinition ? (
                    <p className="text-center text-gray-400 py-4">No custom fields yet. Add one to get started!</p>
                ) : (
                    customFieldDefinitions.map(def => (
                        <div key={def.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-md group">
                            <div>
                                <span className="font-semibold text-white">{def.name}</span>
                                <span className="ml-2 text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">{def.type}</span>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingDefinition(def)} className="p-1 rounded hover:bg-gray-600/50" aria-label={`Edit ${def.name}`}><EditIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDeleteDefinition(def.id)} className="p-1 rounded hover:bg-red-500/50" aria-label={`Delete ${def.name}`}><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {editingDefinition && <FieldEditor definition={editingDefinition} onSave={handleSave} onCancel={() => setEditingDefinition(null)} />}
        </div>
      </div>
    </div>
  );
};

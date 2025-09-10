import React from 'react';
import { SearchableEntity, Status } from '../../types';
import { TableCellsIcon, DocumentTextIcon, FolderIcon, ViewfinderCircleIcon } from '../icons';

interface ResultCardProps {
  item: SearchableEntity;
  onClick: (item: SearchableEntity) => void;
}

const statusColors: { [key in Status]: string } = {
    [Status.Todo]: 'bg-gray-500 text-gray-100',
    [Status.InProgress]: 'bg-blue-500 text-blue-100',
    [Status.Done]: 'bg-green-500 text-green-100',
};

const getIcon = (type: SearchableEntity['entityType']) => {
    switch(type) {
        case 'task': return <TableCellsIcon className="w-5 h-5 text-gray-400" />;
        case 'doc': return <DocumentTextIcon className="w-5 h-5 text-gray-400" />;
        case 'project': return <FolderIcon className="w-5 h-5 text-gray-400" />;
        case 'whiteboard': return <ViewfinderCircleIcon className="w-5 h-5 text-gray-400" />;
        default: return null;
    }
};

const getSnippet = (item: SearchableEntity) => {
    switch(item.entityType) {
        case 'task':
        case 'project':
        case 'whiteboard':
            return item.description;
        case 'doc':
            // A real implementation would generate a snippet from content
            return 'Document content...'
        default:
            return '';
    }
}

export const ResultCard: React.FC<ResultCardProps> = ({ item, onClick }) => {
  return (
    <button onClick={() => onClick(item)} className="block w-full text-left p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">{getIcon(item.entityType)}</div>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-white truncate">{item.title}</p>
                    {item.entityType === 'task' && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[item.status]}`}>
                            {item.status}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-400 mt-1 truncate">{getSnippet(item)}</p>
            </div>
        </div>
    </button>
  );
};
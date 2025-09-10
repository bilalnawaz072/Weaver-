import React from 'react';
import { InsightSuggestion, Task, Project, SuggestionStatus } from '../../../types';
import { CheckCircleIcon, XCircleIcon } from '../../icons';

interface SuggestionCardProps {
    suggestion: InsightSuggestion;
    entity: (Task & { title: string }) | (Project & { name: string }) | undefined;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, entity, onAccept, onReject }) => {
    if (!entity) return null;

    const isPending = suggestion.status === SuggestionStatus.Pending;

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col gap-3">
            <div>
                <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">Suggestion</span>
                <h3 className="font-semibold text-white mt-2">Re: {'name' in entity ? entity.name : entity.title}</h3>
            </div>
            
            <p className="text-sm text-gray-200">{suggestion.suggestion.message}</p>
            <p className="text-xs text-gray-400 italic">"{suggestion.reasoning}"</p>

            <div className="border-t border-gray-700 pt-3 mt-auto flex justify-between items-center">
                {isPending ? (
                    <div className="flex items-center gap-2">
                        <button onClick={() => onAccept(suggestion.id)} className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 bg-green-900/50 hover:bg-green-900/80 px-3 py-1.5 rounded-md transition-colors">
                            <CheckCircleIcon /> Accept
                        </button>
                        <button onClick={() => onReject(suggestion.id)} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 bg-red-900/50 hover:bg-red-900/80 px-3 py-1.5 rounded-md transition-colors">
                             <XCircleIcon /> Reject
                        </button>
                    </div>
                ) : (
                    <p className={`text-sm font-semibold ${suggestion.status === SuggestionStatus.Accepted ? 'text-green-400' : 'text-red-400'}`}>
                        Suggestion {suggestion.status}.
                    </p>
                )}
                 <span className="text-xs text-gray-400">Impact: <span className="font-bold text-gray-200">{Math.round(suggestion.impactScore * 100)}%</span></span>
            </div>
        </div>
    );
};
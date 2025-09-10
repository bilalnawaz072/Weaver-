import React from 'react';
import { XMarkIcon, SparklesIcon, CheckCircleIcon } from '../icons';

interface ProposedTask {
    title: string;
    description: string;
}

interface AIConversionModalProps {
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    proposedTasks: ProposedTask[];
    onClose: () => void;
    onConfirm: (tasksToCreate: ProposedTask[]) => void;
}

export const AIConversionModal: React.FC<AIConversionModalProps> = ({
    isOpen,
    isLoading,
    error,
    proposedTasks,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(proposedTasks);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl relative border border-gray-700 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <XMarkIcon />
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <SparklesIcon className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-2xl font-bold text-white">Convert Ideas to Tasks</h2>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-10">
                            <SparklesIcon className="w-12 h-12 text-indigo-400 animate-pulse mb-4" />
                            <p className="text-lg text-gray-300">Weaver is analyzing your ideas...</p>
                            <p className="text-sm text-gray-500">This may take a moment.</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-900/50 text-red-300 p-4 rounded-lg">
                            <h3 className="font-bold">An Error Occurred</h3>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && (
                         <div>
                             <p className="text-gray-400 mb-4">Review the tasks suggested by the AI. Uncheck any you don't want to create.</p>
                             <div className="space-y-3">
                                 {proposedTasks.length > 0 ? proposedTasks.map((task, index) => (
                                     <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                         <p className="font-semibold text-white">{task.title}</p>
                                         <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                                     </div>
                                 )) : <p className="text-gray-500 text-center py-6">No actionable tasks were found in the selected notes.</p>}
                             </div>
                         </div>
                    )}
                </div>

                <div className="flex justify-end pt-6 space-x-4 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading || error !== null || proposedTasks.length === 0}
                        className="px-6 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <CheckCircleIcon />
                        Create {proposedTasks.length} Tasks
                    </button>
                </div>
            </div>
        </div>
    );
};

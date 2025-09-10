import React from 'react';
import { WorkflowRun } from '../../types';
import { RunStatusBadge } from './RunStatusBadge';

interface RunHistoryListProps {
    runs: WorkflowRun[];
    onSelectRun: (id: string) => void;
}

export const RunHistoryList: React.FC<RunHistoryListProps> = ({ runs, onSelectRun }) => {
    
    const sortedRuns = [...runs].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    const getDuration = (start: Date, end: Date | null): string => {
        if (!end) return '...';
        const durationMs = end.getTime() - start.getTime();
        if (durationMs < 1000) return `${durationMs}ms`;
        return `${(durationMs / 1000).toFixed(2)}s`;
    };

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col">
            <div className="p-4 bg-gray-800 flex-shrink-0 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Run History</h2>
            </div>
            <div className="overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Agent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Started At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {sortedRuns.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                                    <p>No agent runs have been recorded yet.</p>
                                </td>
                            </tr>
                        ) : (
                            sortedRuns.map(run => (
                                <tr key={run.id} onClick={() => onSelectRun(run.id)} className="hover:bg-gray-700/50 cursor-pointer transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RunStatusBadge status={run.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{run.workflowName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{run.startedAt.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getDuration(run.startedAt, run.endedAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

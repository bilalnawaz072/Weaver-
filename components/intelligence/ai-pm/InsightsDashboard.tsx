import React, { useMemo } from 'react';
import { Insight, Task, Project, PredictionType, RiskLevel, InsightSuggestion, Prediction } from '../../../types';
import { PredictionCard } from './PredictionCard';
import { SuggestionCard } from './SuggestionCard';
import { LightBulbIcon } from '../../icons';

interface InsightsDashboardProps {
    insights: Insight[];
    tasks: Task[];
    projects: Project[];
    onAcceptSuggestion: (id: string) => void;
    onRejectSuggestion: (id: string) => void;
}

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ insights, tasks, projects, onAcceptSuggestion, onRejectSuggestion }) => {
    // FIX: The original Map constructor was failing type inference.
    // This revised approach creates a correctly typed Map of entities.
    // It also removes redundant properties in the mapped objects.
    const entityMap = useMemo(() => {
        const allEntities = [
            ...tasks.map(t => ({ ...t, entityType: 'task' as const })),
            ...projects.map(p => ({ ...p, entityType: 'project' as const })),
        ];
        return new Map(allEntities.map(e => [e.id, e]));
    }, [tasks, projects]);

    const riskAlerts = insights.filter((i): i is Prediction & { insightType: 'prediction' } =>
        i.insightType === 'prediction' &&
        i.type === PredictionType.RiskLevel &&
        (i.predictedValue.level === RiskLevel.High || i.predictedValue.level === RiskLevel.Critical)
    );

    const otherInsights = insights.filter(i => !riskAlerts.some(alert => alert.id === i.id));

    return (
        <div className="flex-grow flex flex-col gap-6 overflow-y-auto p-2">
            <header className="flex-shrink-0">
                <div className="flex items-center gap-3">
                    <LightBulbIcon className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-3xl font-bold text-white">AI Project Manager Insights</h1>
                </div>
                <p className="mt-2 text-gray-400">Proactive analysis and suggestions to keep your projects on track.</p>
            </header>

            {riskAlerts.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold text-red-400 mb-4">Critical Alerts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {riskAlerts.map(insight => (
                             <PredictionCard key={insight.id} prediction={insight} entity={entityMap.get(insight.entityId)} />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-xl font-semibold text-gray-300 mb-4">Predictions & Suggestions</h2>
                 {otherInsights.length === 0 && (
                    <div className="text-center text-gray-500 py-10 bg-gray-800/30 rounded-lg">
                        <p>No new predictions or suggestions at this time.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherInsights.map(insight => {
                        if (insight.insightType === 'prediction') {
                            return <PredictionCard key={insight.id} prediction={insight} entity={entityMap.get(insight.entityId)} />;
                        }
                        if (insight.insightType === 'suggestion') {
                            return <SuggestionCard key={insight.id} suggestion={insight} entity={entityMap.get(insight.targetEntityId)} onAccept={onAcceptSuggestion} onReject={onRejectSuggestion} />;
                        }
                        return null;
                    })}
                </div>
            </section>
        </div>
    );
};
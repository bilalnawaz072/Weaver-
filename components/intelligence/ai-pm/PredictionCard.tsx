import React, { useState } from 'react';
import { Prediction, Task, Project, PredictionType, RiskLevel } from '../../../types';
import { ChevronDownIcon, ExclamationTriangleIcon, CalendarDaysIcon } from '../../icons';

interface PredictionCardProps {
    prediction: Prediction;
    entity: (Task & { entityType: 'task', title: string }) | (Project & { entityType: 'project', name: string }) | undefined;
}

const riskColors = {
    [RiskLevel.Low]: 'text-gray-400 border-gray-600',
    [RiskLevel.Medium]: 'text-yellow-400 border-yellow-600',
    [RiskLevel.High]: 'text-orange-400 border-orange-600',
    [RiskLevel.Critical]: 'text-red-400 border-red-600',
};

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, entity }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!entity) return null;

    const renderPredictionValue = () => {
        switch (prediction.type) {
            case PredictionType.CompletionDate:
                const predictedDate = new Date(prediction.predictedValue.date!);
                const originalDueDate = (entity as Task).dueDate;
                const isLate = originalDueDate && predictedDate > originalDueDate;
                return (
                    <div className="flex items-center gap-3">
                        <CalendarDaysIcon className={isLate ? 'text-red-400' : 'text-green-400'} />
                        <div>
                            <p className="font-semibold text-lg text-white">{predictedDate.toLocaleDateString()}</p>
                            <p className={`text-xs ${isLate ? 'text-red-400' : 'text-gray-400'}`}>
                                Predicted Completion {isLate && originalDueDate ? `(Original: ${originalDueDate.toLocaleDateString()})` : ''}
                            </p>
                        </div>
                    </div>
                );
            case PredictionType.RiskLevel:
                const level = prediction.predictedValue.level!;
                return (
                    <div className={`flex items-center gap-3 p-2 border-l-4 ${riskColors[level]}`}>
                        <ExclamationTriangleIcon />
                        <div>
                            <p className="font-semibold text-lg text-white">{level} Risk</p>
                            <p className="text-xs">Predicted Risk Level</p>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col gap-3">
            <div>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full capitalize">{entity.entityType}</span>
                <h3 className="font-semibold text-white mt-2 truncate">{entity.entityType === 'project' ? entity.name : entity.title}</h3>
            </div>
            {renderPredictionValue()}
            <div className="text-xs text-gray-400 flex items-center justify-between">
                <span>Confidence: <span className="font-bold text-gray-200">{Math.round(prediction.confidenceScore * 100)}%</span></span>
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 hover:text-white">
                    Why? <ChevronDownIcon className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {isExpanded && (
                <div className="border-t border-gray-700 pt-3 mt-1 text-xs text-gray-300 space-y-1">
                    <p className="font-semibold text-gray-400">Factors considered:</p>
                    <ul className="list-disc list-inside pl-2">
                        {prediction.factors.map((factor, i) => <li key={i}>{factor}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};
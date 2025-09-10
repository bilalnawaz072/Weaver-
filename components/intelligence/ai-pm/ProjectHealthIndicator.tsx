import React from 'react';

interface ProjectHealthIndicatorProps {
    health: { level: 'green' | 'yellow' | 'red'; reason: string } | undefined;
}

const healthColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
};

export const ProjectHealthIndicator: React.FC<ProjectHealthIndicatorProps> = ({ health }) => {
    if (!health) return null;

    return (
        <div className="group relative flex items-center">
            <div className={`w-3 h-3 rounded-full ${healthColors[health.level]}`} />
            <div className="absolute left-full ml-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
                {health.reason}
            </div>
        </div>
    );
};
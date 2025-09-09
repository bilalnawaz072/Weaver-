import React, { useState, useMemo } from 'react';
import { Task, Status } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

// --- Date Helper Functions ---
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getMonthName = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });
const getWeekName = (date: Date) => {
    const endOfWeek = addDays(date, 6);
    return `${date.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
};

const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
};

const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const dayDiff = (date1: Date, date2: Date) => {
    return Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
};
// --- End Date Helpers ---

const statusColors: { [key in Status]: string } = {
  [Status.Todo]: 'bg-gray-500 hover:bg-gray-400',
  [Status.InProgress]: 'bg-blue-500 hover:bg-blue-400',
  [Status.Done]: 'bg-green-500 hover:bg-green-400',
};

interface TimelineViewProps {
  tasks: Task[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks }) => {
  const [viewMode, setViewMode] = useState<'Month' | 'Week'>('Month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: React.ReactNode; x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip?.visible) {
      setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const showTooltip = (task: Task, e: React.MouseEvent) => {
    const content = (
      <>
        <div className="font-bold text-lg mb-2">{task.title}</div>
        <p className="text-sm text-gray-300 mb-2 whitespace-pre-wrap">{task.description || 'No description'}</p>
        <div className="border-t border-gray-600 pt-2 text-xs space-y-1">
          <div><span className="font-semibold text-gray-400">Status:</span> {task.status}</div>
          <div><span className="font-semibold text-gray-400">Start:</span> {task.startDate?.toLocaleDateString() ?? 'N/A'}</div>
          <div><span className="font-semibold text-gray-400">Due:</span> {task.dueDate?.toLocaleDateString() ?? 'N/A'}</div>
        </div>
      </>
    );
    setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
  };

  const { startDate, endDate, headers } = useMemo(() => {
    let startDate: Date;
    let headers: { label: string, days: number }[];

    if (viewMode === 'Month') {
        startDate = getStartOfMonth(currentDate);
        const numDays = getDaysInMonth(currentDate);
        headers = [{ label: getMonthName(currentDate), days: numDays }];
    } else { // Week
        startDate = getStartOfWeek(currentDate);
        headers = [{ label: getWeekName(currentDate), days: 7 }];
    }
    const endDate = addDays(startDate, headers[0].days - 1);
    return { startDate, endDate, headers };
  }, [currentDate, viewMode]);

  const handlePrev = () => {
    if (viewMode === 'Month') {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
        setCurrentDate(addDays(currentDate, -7));
    }
  };

  const handleNext = () => {
    if (viewMode === 'Month') {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
        setCurrentDate(addDays(currentDate, 7));
    }
  };

  const scheduledTasks = tasks
    .filter(t => t.startDate || t.dueDate)
    .map(t => ({
        ...t,
        startDate: t.startDate || t.dueDate!,
        dueDate: t.dueDate || t.startDate!,
    }))
    .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime());

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col overflow-hidden" onMouseMove={handleMouseMove}>
        {/* Header and Controls */}
        <div className="p-4 bg-gray-800 flex justify-between items-center flex-shrink-0 border-b border-gray-700">
            <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="p-2 rounded-md hover:bg-gray-700"><ChevronLeftIcon /></button>
                <span className="font-bold text-lg text-white w-48 text-center">{headers[0].label}</span>
                <button onClick={handleNext} className="p-2 rounded-md hover:bg-gray-700"><ChevronRightIcon /></button>
            </div>
            <div className="flex items-center bg-gray-900 p-1 rounded-lg">
                <button onClick={() => setViewMode('Week')} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'Week' ? 'bg-indigo-600' : ''}`}>Week</button>
                <button onClick={() => setViewMode('Month')} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'Month' ? 'bg-indigo-600' : ''}`}>Month</button>
            </div>
        </div>

        {/* Timeline Grid */}
        <div className="overflow-auto flex-grow">
            <div className="inline-block min-w-full">
                {/* Timeline Header */}
                <div className="grid border-b-2 border-gray-700 sticky top-0 bg-gray-800 z-10" style={{ gridTemplateColumns: `300px repeat(${headers[0].days}, minmax(40px, 1fr))`}}>
                    <div className="p-2 border-r border-gray-700 text-sm font-semibold text-gray-300">Task</div>
                    {Array.from({ length: headers[0].days }).map((_, i) => {
                        const day = addDays(startDate, i);
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        return (
                            <div key={i} className={`p-2 text-center text-xs ${isWeekend ? 'bg-gray-700/50' : ''}`}>
                                <div className="text-gray-400">{day.toLocaleDateString('default', { weekday: 'short' })}</div>
                                <div>{day.getDate()}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Task Rows */}
                {scheduledTasks.length > 0 ? (
                    scheduledTasks.map(task => {
                        const taskStart = task.startDate!;
                        const taskEnd = task.dueDate!;
                        if (taskEnd < startDate || taskStart > endDate) return null;

                        const startOffset = Math.max(0, dayDiff(taskStart, startDate));
                        const endOffset = Math.min(headers[0].days, dayDiff(taskEnd, startDate) + 1);

                        if (startOffset >= endOffset) return null;

                        const barStyle = {
                            gridColumnStart: startOffset + 2,
                            gridColumnEnd: endOffset + 2,
                        };

                        return (
                            <div key={task.id} className="grid items-center border-b border-gray-700 hover:bg-gray-700/30" style={{ gridTemplateColumns: `300px repeat(${headers[0].days}, minmax(40px, 1fr))`}}>
                                <div className="p-2 border-r border-gray-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{task.title}</div>
                                <div 
                                    className="h-full py-2" 
                                    style={barStyle}
                                    onMouseEnter={(e) => showTooltip(task, e)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className={`h-full rounded-md text-white text-xs flex items-center px-2 overflow-hidden transition-colors duration-200 ${statusColors[task.status]}`}>
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{task.title}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-400 py-16">
                        <h3 className="text-lg font-semibold text-white">No Scheduled Tasks</h3>
                        <p className="mt-1 text-sm text-gray-500">Add start and due dates to tasks to see them on the timeline.</p>
                    </div>
                )}
            </div>
        </div>
         {tooltip && tooltip.visible && (
            <div
                style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
                className="fixed bg-gray-900 border border-gray-600 rounded-lg p-4 shadow-2xl z-50 max-w-xs pointer-events-none transition-opacity duration-200"
                role="tooltip"
            >
                {tooltip.content}
            </div>
        )}
    </div>
  );
};

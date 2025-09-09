import React, { useState, useMemo } from 'react';
import { Task, Status } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarViewProps {
  tasks: Task[];
}

const statusColors: { [key in Status]: string } = {
  [Status.Todo]: 'bg-gray-500 border-gray-400',
  [Status.InProgress]: 'bg-blue-500 border-blue-400',
  [Status.Done]: 'bg-green-500 border-green-400',
};

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
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
    e.stopPropagation();
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

  const { month, year } = useMemo(() => ({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
  }), [currentDate]);

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];
    let day = 1;
    for (let i = 0; i < 6; i++) { // Max 6 weeks in a month
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(new Date(year, month, day));
          day++;
        }
      }
      grid.push(week);
      if (day > daysInMonth) break;
    }
    return grid;
  }, [month, year]);
  
  const tasksByDueDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
        if (task.dueDate) {
            const dateKey = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate()).toISOString();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(task);
        }
    });
    return map;
  }, [tasks]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex-grow flex flex-col overflow-hidden" onMouseMove={handleMouseMove}>
        {/* Header and Controls */}
        <div className="p-4 bg-gray-800 flex justify-between items-center flex-shrink-0 border-b border-gray-700">
            <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-700"><ChevronLeftIcon /></button>
                 <h2 className="text-xl font-bold text-white w-48 text-center">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-700"><ChevronRightIcon /></button>
            </div>
            <button onClick={handleToday} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600">Today</button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-grow">
            {/* Day Headers */}
            {daysOfWeek.map(day => (
                <div key={day} className="text-center font-bold text-gray-400 p-2 border-r border-b border-gray-700">{day}</div>
            ))}

            {/* Day Cells */}
            {calendarGrid.flat().map((date, index) => {
                const isToday = date && date.toDateString() === new Date().toDateString();
                const tasksForDay = date ? tasksByDueDate.get(date.toISOString()) || [] : [];

                return (
                    <div key={index} className={`p-2 border-r border-b border-gray-700 min-h-[120px] flex flex-col ${date ? '' : 'bg-gray-800/50'} ${index % 7 === 6 ? 'border-r-0' : ''}`}>
                        {date && (
                             <span className={`font-bold text-sm mb-2 ${isToday ? 'text-indigo-400 bg-indigo-600/20 rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                                {date.getDate()}
                            </span>
                        )}
                        <div className="flex-grow space-y-1 overflow-y-auto">
                            {tasksForDay.map(task => (
                                <div 
                                    key={task.id} 
                                    className={`text-xs p-1.5 rounded-md text-white border-l-4 cursor-pointer ${statusColors[task.status]}`}
                                    onMouseEnter={(e) => showTooltip(task, e)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <p className="font-semibold truncate">{task.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
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


import React from 'react';
import { ScheduleItem } from '../types';
import { EditIcon, TrashIcon, PlusCircleIcon } from './icons';

interface ScheduleEditorProps {
  schedule: ScheduleItem[];
  selectedItemId: string | null;
  onUpdate: (item: ScheduleItem) => void;
  onSplit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectItem: (id: string | null) => void;
}

const formatTime = (hour: number) => {
    const h = Math.floor(hour) % 24;
    const m = Math.round((hour % 1) * 60);
    if (m === 60) {
      return `${String(h + 1).padStart(2, '0')}:00`;
    }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  
const parseTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
};

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ schedule, selectedItemId, onUpdate, onSplit, onDelete, onSelectItem }) => {
  const sortedSchedule = [...schedule].sort((a, b) => a.start - b.start);

  return (
    <div className="p-4 space-y-3">
       <h2 className="text-xl font-semibold mb-3 text-gray-300">タイムスケジュール</h2>
      {sortedSchedule.map((item, index) => {
        const duration = item.end - item.start;
        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item.id)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedItemId === item.id ? 'bg-slate-700/50 border-blue-500' : 'bg-slate-700 border-transparent'
            }`}
            style={{ borderLeftColor: item.color, borderLeftWidth: '4px' }}
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdate({ ...item, name: e.target.value })}
                className="bg-transparent font-semibold w-1/2 focus:bg-slate-600 rounded px-1 outline-none"
              />
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{formatTime(item.start)}</span>
                <span>-</span>
                 {index === sortedSchedule.length - 1 ? (
                   <span>{formatTime(item.end)}</span>
                ) : (
                    <input
                        type="time"
                        value={formatTime(item.end)}
                        onChange={(e) => onUpdate({ ...item, end: parseTime(e.target.value) })}
                        className="bg-slate-600 rounded px-1 text-gray-200 outline-none"
                    />
                 )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                     <input
                        type="color"
                        value={item.color}
                        onChange={(e) => onUpdate({ ...item, color: e.target.value })}
                        className="w-8 h-8 bg-transparent border-none rounded cursor-pointer"
                        title="Change color"
                    />
                    <span className="text-xs text-gray-400">{duration.toFixed(1)} 時間</span>
                </div>
              <div className="flex items-center space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onSplit(item.id); }} className="p-1 text-gray-400 hover:text-green-400 transition-colors" title="Split Task">
                  <PlusCircleIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1 text-gray-400 hover:text-red-400 transition-colors" title="Delete Task">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleEditor;

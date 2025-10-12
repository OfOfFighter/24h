
import React, { useState } from 'react';
import { ScheduleItem, TodoItem, Preset } from '../types.ts';
import ScheduleEditor from './ScheduleEditor.tsx';
import TodoList from './TodoList.tsx';
import PresetManager from './PresetManager.tsx';
import { ClockIcon, ListCheckIcon, SaveIcon } from './icons.tsx';

interface SidePanelProps {
  schedule: ScheduleItem[];
  todos: TodoItem[];
  presets: Preset[];
  selectedItemId: string | null;
  onUpdateScheduleItem: (item: ScheduleItem) => void;
  onSplitScheduleItem: (id: string) => void;
  onDeleteScheduleItem: (id: string) => void;
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onSavePreset: (name: string) => void;
  onLoadPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  onSelectItem: (id: string | null) => void;
}

type ActiveTab = 'schedule' | 'todo' | 'presets';

const SidePanel: React.FC<SidePanelProps> = (props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');

  const TabButton: React.FC<{ tabName: ActiveTab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 flex items-center justify-center p-3 text-sm font-medium transition-colors duration-200 border-b-2
        ${activeTab === tabName ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent hover:bg-slate-700'}`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="hidden md:flex items-center p-4 border-b border-slate-700">
        <ClockIcon className="w-8 h-8 mr-3 text-blue-400" />
        <h1 className="text-2xl font-bold tracking-tight">24h Pie Scheduler</h1>
      </div>
      <div className="flex border-b border-slate-700">
        <TabButton tabName="schedule" label="スケジュール" icon={<ClockIcon className="w-5 h-5" />} />
        <TabButton tabName="todo" label="TODO" icon={<ListCheckIcon className="w-5 h-5" />} />
        <TabButton tabName="presets" label="プリセット" icon={<SaveIcon className="w-5 h-5" />} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'schedule' && (
          <ScheduleEditor
            schedule={props.schedule}
            selectedItemId={props.selectedItemId}
            onUpdate={props.onUpdateScheduleItem}
            onSplit={props.onSplitScheduleItem}
            onDelete={props.onDeleteScheduleItem}
            onSelectItem={props.onSelectItem}
          />
        )}
        {activeTab === 'todo' && (
          <TodoList
            todos={props.todos}
            onAdd={props.onAddTodo}
            onToggle={props.onToggleTodo}
            onDelete={props.onDeleteTodo}
          />
        )}
        {activeTab === 'presets' && (
          <PresetManager
            presets={props.presets}
            onSave={props.onSavePreset}
            onLoad={props.onLoadPreset}
            onDelete={props.onDeletePreset}
          />
        )}
      </div>
    </div>
  );
};

export default SidePanel;

import React, { useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import SidePanel from './components/SidePanel.tsx';
import SchedulePieChart from './components/SchedulePieChart.tsx';
import BottomNavBar, { MobileView } from './components/BottomNavBar.tsx';
import ScheduleEditor from './components/ScheduleEditor.tsx';
import TodoList from './components/TodoList.tsx';
import PresetManager from './components/PresetManager.tsx';
import { ScheduleItem, TodoItem, Preset } from './types.ts';

const defaultSchedule: ScheduleItem[] = [
  { id: '1', name: '睡眠', start: 0, end: 7, color: '#1F2937' },
  { id: '2', name: '朝の準備', start: 7, end: 8, color: '#3B82F6' },
  { id: '3', name: '仕事', start: 8, end: 12, color: '#10B981' },
  { id: '4', name: '昼食', start: 12, end: 13, color: '#F59E0B' },
  { id: '5', name: '仕事', start: 13, end: 17, color: '#10B981' },
  { id: '6', name: '運動', start: 17, end: 18, color: '#EF4444' },
  { id: '7', name: '夕食', start: 18, end: 19, color: '#F59E0B' },
  { id: '8', name: '自由時間', start: 19, end: 22, color: '#8B5CF6' },
  { id: '9', name: '就寝準備', start: 22, end: 23, color: '#3B82F6' },
  { id: '10', name: '睡眠', start: 23, end: 24, color: '#1F2937' },
];

const defaultPresets: Preset[] = [
  { id: 'default', name: 'デフォルト', schedule: defaultSchedule },
];

const App: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('chart');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedSchedule = localStorage.getItem('schedule-pie-planner-schedule');
      const savedTodos = localStorage.getItem('schedule-pie-planner-todos');
      const savedPresets = localStorage.getItem('schedule-pie-planner-presets');

      setSchedule(savedSchedule ? JSON.parse(savedSchedule) : defaultSchedule);
      setTodos(savedTodos ? JSON.parse(savedTodos) : []);
      setPresets(savedPresets ? JSON.parse(savedPresets) : defaultPresets);
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setSchedule(defaultSchedule);
      setTodos([]);
      setPresets(defaultPresets);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('schedule-pie-planner-schedule', JSON.stringify(schedule));
      localStorage.setItem('schedule-pie-planner-todos', JSON.stringify(todos));
      localStorage.setItem('schedule-pie-planner-presets', JSON.stringify(presets));
    }
  }, [schedule, todos, presets, isLoaded]);

  const handleSelectItem = (id: string | null) => {
    setSelectedItemId(id);
  };

  const handleUpdateScheduleItem = useCallback((updatedItem: ScheduleItem) => {
    setSchedule(currentSchedule => {
      const sortedSchedule = [...currentSchedule].sort((a, b) => a.start - b.start);
      const itemIndex = sortedSchedule.findIndex(item => item.id === updatedItem.id);
      if (itemIndex === -1) return currentSchedule;
      
      const originalItem = sortedSchedule[itemIndex];

      return produce(currentSchedule, draft => {
        const draftIndex = draft.findIndex(item => item.id === updatedItem.id);
        if (draftIndex === -1) return;

        if (originalItem.end !== updatedItem.end) {
          if (itemIndex < sortedSchedule.length - 1) {
            const nextItem = sortedSchedule[itemIndex + 1];
            const nextDraftItem = draft.find(i => i.id === nextItem.id);
            if (nextDraftItem) {
              if (updatedItem.end >= nextDraftItem.end) {
                updatedItem.end = nextDraftItem.end - 0.1; 
              }
              if (updatedItem.end <= updatedItem.start) {
                updatedItem.end = updatedItem.start + 0.1;
              }
              nextDraftItem.start = updatedItem.end;
            }
          } else {
            updatedItem.end = 24;
          }
        }
        
        const currentDraftItem = draft[draftIndex];
        Object.assign(currentDraftItem, updatedItem);
      });
    });
  }, []);

  const handleSplitScheduleItem = useCallback((id: string) => {
    setSchedule(produce(draft => {
      const itemIndex = draft.findIndex(item => item.id === id);
      if (itemIndex === -1) return;

      const item = draft[itemIndex];
      const duration = item.end - item.start;
      if (duration < 0.2) return; 

      const midPoint = item.start + duration / 2;
      const originalEnd = item.end;
      item.end = midPoint;

      const newItem: ScheduleItem = {
        id: uuidv4(),
        name: item.name,
        start: midPoint,
        end: originalEnd,
        color: item.color,
      };
      draft.splice(itemIndex + 1, 0, newItem);
    }));
  }, []);

  const handleDeleteScheduleItem = useCallback((id: string) => {
    if (schedule.length <= 1) {
      alert("最後の項目は削除できません。");
      return;
    }
    setSchedule(currentSchedule => {
        const sortedSchedule = [...currentSchedule].sort((a, b) => a.start - b.start);
        const itemIndex = sortedSchedule.findIndex(item => item.id === id);
        if (itemIndex === -1) return currentSchedule;

        const itemToDelete = sortedSchedule[itemIndex];

        return produce(currentSchedule, draft => {
            if (itemIndex > 0) {
                const prevItem = sortedSchedule[itemIndex - 1];
                const draftPrev = draft.find(i => i.id === prevItem.id);
                if (draftPrev) draftPrev.end = itemToDelete.end;
            } else {
                const nextItem = sortedSchedule[itemIndex + 1];
                const draftNext = draft.find(i => i.id === nextItem.id);
                if (draftNext) draftNext.start = itemToDelete.start;
            }
            const draftIndex = draft.findIndex(item => item.id === id);
            if (draftIndex > -1) draft.splice(draftIndex, 1);
        });
    });
  }, [schedule.length]);

  const handleAddTodo = useCallback((text: string) => {
    if (!text.trim()) return;
    const newTodo: TodoItem = { id: uuidv4(), text, completed: false };
    setTodos(produce(draft => {
      draft.push(newTodo);
    }));
  }, []);

  const handleToggleTodo = useCallback((id: string) => {
    setTodos(produce(draft => {
      const todo = draft.find(t => t.id === id);
      if (todo) todo.completed = !todo.completed;
    }));
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos(todos => todos.filter(t => t.id !== id));
  }, []);

  const handleSavePreset = useCallback((name: string) => {
    if (!name.trim()) {
      alert("プリセット名を入力してください。");
      return;
    }
    const newPreset: Preset = { id: uuidv4(), name, schedule: schedule };
    setPresets(produce(draft => {
      draft.push(newPreset);
    }));
    alert(`プリセット「${name}」を保存しました。`);
  }, [schedule]);

  const onLoadPreset = useCallback((id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setSchedule(preset.schedule);
      alert(`プリセット「${preset.name}」を読み込みました。`);
    }
  }, [presets]);

  const onDeletePreset = useCallback((id: string) => {
    if (id === 'default') {
      alert("デフォルトのプリセットは削除できません。");
      return;
    }
    setPresets(presets => presets.filter(p => p.id !== id));
    alert("プリセットを削除しました。");
  }, []);
  
  const sidePanelProps = {
    schedule, todos, presets, selectedItemId,
    onUpdateScheduleItem: handleUpdateScheduleItem,
    onSplitScheduleItem: handleSplitScheduleItem,
    onDeleteScheduleItem: handleDeleteScheduleItem,
    onAddTodo: handleAddTodo,
    onToggleTodo: handleToggleTodo,
    onDeleteTodo: handleDeleteTodo,
    onSavePreset: handleSavePreset,
    onLoadPreset: onLoadPreset,
    onDeletePreset: onDeletePreset,
    onSelectItem: handleSelectItem,
  };

  const renderMobileView = () => {
    switch (mobileView) {
      case 'chart':
        return <SchedulePieChart schedule={schedule} selectedItemId={selectedItemId} onSelectItem={handleSelectItem} />;
      case 'schedule':
        return <ScheduleEditor schedule={schedule} selectedItemId={selectedItemId} onUpdate={handleUpdateScheduleItem} onSplit={handleSplitScheduleItem} onDelete={handleDeleteScheduleItem} onSelectItem={handleSelectItem} />;
      case 'todo':
        return <TodoList todos={todos} onAdd={handleAddTodo} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />;
      case 'presets':
        return <PresetManager presets={presets} onSave={handleSavePreset} onLoad={onLoadPreset} onDelete={onDeletePreset} />;
      default:
        return <SchedulePieChart schedule={schedule} selectedItemId={selectedItemId} onSelectItem={handleSelectItem} />;
    }
  };

  return (
    <div className="bg-slate-800 text-white font-sans h-screen flex flex-col md:flex-row overflow-hidden">
      <aside className="w-full md:w-1/3 lg:w-1/4 h-full border-r border-slate-700 bg-slate-800 hidden md:block">
        <SidePanel {...sidePanelProps} />
      </aside>

      <main className="flex-1 h-full flex flex-col">
        <div className="md:hidden p-4 border-b border-slate-700 flex items-center">
             <h1 className="text-xl font-bold tracking-tight">24h Pie Scheduler</h1>
        </div>
        <div className="flex-1 relative overflow-y-auto">
          <div className="hidden md:block w-full h-full">
            <SchedulePieChart schedule={schedule} selectedItemId={selectedItemId} onSelectItem={handleSelectItem} />
          </div>
          <div className="md:hidden w-full h-full">
            {renderMobileView()}
          </div>
        </div>
        <BottomNavBar activeView={mobileView} setView={setMobileView} />
      </main>
    </div>
  );
};

export default App;

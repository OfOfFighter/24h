
import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleItem, TodoItem, Preset } from './types.ts';
import SchedulePieChart from './components/SchedulePieChart.tsx';
import SidePanel from './components/SidePanel.tsx';
import ScheduleEditor from './components/ScheduleEditor.tsx';
import TodoList from './components/TodoList.tsx';
import PresetManager from './components/PresetManager.tsx';
import BottomNavBar, { MobileView } from './components/BottomNavBar.tsx';
import { ClockIcon } from './components/icons.tsx';

const DEFAULT_COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

const createInitialSchedule = (): ScheduleItem[] => {
  return [
    { id: '1', name: '睡眠', start: 0, end: 7, color: '#1f77b4' },
    { id: '2', name: '準備・通勤', start: 7, end: 9, color: '#ff7f0e' },
    { id: '3', name: '仕事', start: 9, end: 12, color: '#2ca02c' },
    { id: '4', name: '昼食', start: 12, end: 13, color: '#d62728' },
    { id: '5', name: '仕事', start: 13, end: 18, color: '#9467bd' },
    { id: '6', name: '夕食・リラックス', start: 18, end: 21, color: '#8c564b' },
    { id: '7', name: '趣味・学習', start: 21, end: 23, color: '#e377c2' },
    { id: '8', name: '就寝準備', start: 23, end: 24, color: '#7f7f7f' },
  ];
};

const App: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const savedSchedule = localStorage.getItem('schedule');
    return savedSchedule ? JSON.parse(savedSchedule) : createInitialSchedule();
  });
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [presets, setPresets] = useState<Preset[]>(() => {
    const savedPresets = localStorage.getItem('presets');
    return savedPresets ? JSON.parse(savedPresets) : [
      { id: 'default', name: 'デフォルト', schedule: createInitialSchedule() }
    ];
  });
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('chart');

  useEffect(() => {
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('presets', JSON.stringify(presets));
  }, [presets]);

  const handleUpdateScheduleItem = useCallback((updatedItem: ScheduleItem) => {
    const itemIndex = schedule.findIndex(item => item.id === updatedItem.id);
    if (itemIndex === -1) return;

    const newSchedule = [...schedule];
    const originalItem = newSchedule[itemIndex];

    if (originalItem.start === updatedItem.start && originalItem.end === updatedItem.end) {
        newSchedule[itemIndex] = updatedItem;
        setSchedule(newSchedule);
        return;
    }

    let timeDiff = updatedItem.end - originalItem.end;
    
    if (updatedItem.end <= updatedItem.start) {
        updatedItem.end = updatedItem.start + 0.5;
    }
     if (updatedItem.end > 24) {
        updatedItem.end = 24;
    }

    newSchedule[itemIndex] = { ...updatedItem };
    
    const nextIndex = (itemIndex + 1) % newSchedule.length;
    
    if (itemIndex === newSchedule.length - 1) {
        newSchedule[itemIndex].end = 24;
        newSchedule[itemIndex].start = newSchedule[itemIndex-1].end;
        setSchedule(newSchedule);
        return;
    }
    
    newSchedule[nextIndex].start = newSchedule[itemIndex].end;
    
    const normalizedSchedule = newSchedule.map((item, index) => {
        if (index === 0) {
            return { ...item, start: 0 };
        }
        const prevItem = newSchedule[index - 1];
        const newStart = prevItem.end;
        return { ...item, start: newStart, end: item.end - (item.start - newStart) };
    });
    
    normalizedSchedule[normalizedSchedule.length-1].end = 24;
    
    setSchedule(normalizedSchedule);
  }, [schedule]);
  
  const handleSplitScheduleItem = useCallback((itemId: string) => {
    const itemIndex = schedule.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const itemToSplit = schedule[itemIndex];
    const duration = itemToSplit.end - itemToSplit.start;
    if (duration < 1) return;

    const midPoint = itemToSplit.start + duration / 2;

    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      name: '新しいタスク',
      start: midPoint,
      end: itemToSplit.end,
      color: DEFAULT_COLORS[schedule.length % DEFAULT_COLORS.length],
    };

    const updatedItem = { ...itemToSplit, end: midPoint };

    const newSchedule = [...schedule];
    newSchedule.splice(itemIndex + 1, 0, newItem);
    newSchedule[itemIndex] = updatedItem;

    setSchedule(newSchedule);
  }, [schedule]);


  const handleDeleteScheduleItem = useCallback((itemId: string) => {
    if (schedule.length <= 1) return;

    const itemIndex = schedule.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const itemToDelete = schedule[itemIndex];
    const duration = itemToDelete.end - itemToDelete.start;

    const newSchedule = schedule.filter(item => item.id !== itemId);
    
    if (itemIndex > 0) {
        newSchedule[itemIndex-1].end += duration;
    } else {
        newSchedule[0].start = 0;
        newSchedule[0].end = newSchedule[0].end - newSchedule[0].start;
    }

    // Normalize
    const normalized = newSchedule.reduce((acc, item, index) => {
        if (index === 0) {
            item.start = 0;
            acc.push(item);
            return acc;
        }
        const prev = acc[index-1];
        item.start = prev.end;
        acc.push(item);
        return acc;
    }, [] as ScheduleItem[]);
    normalized[normalized.length-1].end = 24;

    setSchedule(normalized);
  }, [schedule]);


  const handleAddTodo = (text: string) => {
    if (!text.trim()) return;
    const newTodo: TodoItem = { id: Date.now().toString(), text, completed: false };
    setTodos([newTodo, ...todos]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleSavePreset = (name: string) => {
    if (!name.trim()) return;
    const newPreset: Preset = { id: Date.now().toString(), name, schedule: [...schedule] };
    setPresets([...presets, newPreset]);
  };

  const handleLoadPreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setSchedule(preset.schedule);
    }
  };
  
  const handleDeletePreset = (id: string) => {
    if (id === 'default') return;
    setPresets(presets.filter(p => p.id !== id));
  };

  const viewTitles: { [key in MobileView]: string } = {
    chart: '24h Pie Scheduler',
    schedule: 'タイムスケジュール',
    todo: 'TODOリスト',
    presets: 'プリセット管理',
  };

  const renderMobileView = () => {
    switch (mobileView) {
      case 'chart':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full max-w-3xl max-h-[80vh] aspect-square">
              <SchedulePieChart 
                schedule={schedule} 
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
              />
            </div>
          </div>
        );
      case 'schedule':
        return (
          <ScheduleEditor
            schedule={schedule}
            selectedItemId={selectedItemId}
            onUpdate={handleUpdateScheduleItem}
            onSplit={handleSplitScheduleItem}
            onDelete={handleDeleteScheduleItem}
            onSelectItem={setSelectedItemId}
          />
        );
      case 'todo':
        return (
          <TodoList
            todos={todos}
            onAdd={handleAddTodo}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        );
      case 'presets':
        return (
          <PresetManager
            presets={presets}
            onSave={handleSavePreset}
            onLoad={handleLoadPreset}
            onDelete={handleDeletePreset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-100 font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-center p-4 bg-slate-800 border-b border-slate-700 shrink-0">
        <ClockIcon className="w-7 h-7 mr-2 text-blue-400" />
        <h1 className="text-xl font-bold tracking-tight">{viewTitles[mobileView]}</h1>
      </header>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-2/5 lg:w-1/3 xl:w-1/4 flex flex-col bg-slate-800 shadow-lg">
          <SidePanel
            schedule={schedule}
            todos={todos}
            presets={presets}
            selectedItemId={selectedItemId}
            onUpdateScheduleItem={handleUpdateScheduleItem}
            onSplitScheduleItem={handleSplitScheduleItem}
            onDeleteScheduleItem={handleDeleteScheduleItem}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            onSelectItem={setSelectedItemId}
          />
        </div>
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-slate-900">
          <div className="w-full h-full max-w-3xl max-h-[80vh] aspect-square">
            <SchedulePieChart 
              schedule={schedule} 
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
            />
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <main className="md:hidden flex-1 overflow-y-auto p-2 sm:p-4">
        {renderMobileView()}
      </main>
      
      <BottomNavBar 
        activeView={mobileView}
        setView={setMobileView}
      />
    </div>
  );
};

export default App;
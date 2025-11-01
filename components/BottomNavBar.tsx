import React from 'react';
import { ClockIcon, ListCheckIcon, SaveIcon, ChartPieIcon } from './icons';

export type MobileView = 'chart' | 'schedule' | 'todo' | 'presets';

interface BottomNavBarProps {
  activeView: MobileView;
  setView: (view: MobileView) => void;
}

const NavButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-1/4 py-2 transition-colors duration-200 ${
            isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
        }`}
        aria-label={label}
        aria-current={isActive}
    >
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setView }) => {
  return (
    <nav className="md:hidden sticky bottom-0 left-0 right-0 flex justify-around bg-slate-800 border-t border-slate-700 z-10">
      <NavButton
        label="グラフ"
        icon={<ChartPieIcon className="w-6 h-6" />}
        isActive={activeView === 'chart'}
        onClick={() => setView('chart')}
      />
      <NavButton
        label="リスト"
        icon={<ClockIcon className="w-6 h-6" />}
        isActive={activeView === 'schedule'}
        onClick={() => setView('schedule')}
      />
      <NavButton
        label="TODO"
        icon={<ListCheckIcon className="w-6 h-6" />}
        isActive={activeView === 'todo'}
        onClick={() => setView('todo')}
      />
      <NavButton
        label="プリセット"
        icon={<SaveIcon className="w-6 h-6" />}
        isActive={activeView === 'presets'}
        onClick={() => setView('presets')}
      />
    </nav>
  );
};

export default BottomNavBar;
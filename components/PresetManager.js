import React, { useState } from 'react';
import { Preset } from '../types.js';
import { SaveIcon, LoadIcon, TrashIcon } from './icons.js';

interface PresetManagerProps {
  presets: Preset[];
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ presets, onSave, onLoad, onDelete }) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(presets.length > 0 ? presets[0].id : '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newPresetName);
    setNewPresetName('');
  };
  
  const handleLoad = () => {
      if (selectedPresetId) {
          onLoad(selectedPresetId);
      }
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-gray-300">プリセット管理</h2>

      {/* Save Preset Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">現在のスケジュールを保存</h3>
        <form onSubmit={handleSave} className="flex">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="プリセット名..."
            className="flex-grow bg-slate-700 text-white rounded-l-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r-md transition-colors"
          >
            <SaveIcon className="w-5 h-5 mr-1"/> 保存
          </button>
        </form>
      </div>

      {/* Load Preset Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">プリセットを読み込む</h3>
        <div className="flex space-x-2">
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="flex-grow bg-slate-700 text-white rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {presets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleLoad}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            <LoadIcon className="w-5 h-5 mr-1" /> 読み込み
          </button>
           <button
            onClick={() => onDelete(selectedPresetId)}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold p-2.5 rounded-md transition-colors disabled:opacity-50"
            disabled={selectedPresetId === 'default'}
            title="Delete selected preset"
          >
            <TrashIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresetManager;
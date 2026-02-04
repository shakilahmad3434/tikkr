import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { X, Save, Bell, Clock, RefreshCcw } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-[2.5rem] p-8 w-full max-w-md border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
              <Clock className="text-orange-500" size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-100 uppercase tracking-widest italic">Settings</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Time Durations */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Time (Minutes)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Work</label>
                <input 
                  type="number" 
                  value={localSettings.workDuration}
                  onChange={(e) => handleChange('workDuration', parseInt(e.target.value) || 1)}
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-orange-400 font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Short</label>
                <input 
                  type="number" 
                  value={localSettings.shortBreakDuration}
                  onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value) || 1)}
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Long</label>
                <input 
                  type="number" 
                  value={localSettings.longBreakDuration}
                  onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value) || 1)}
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-blue-400 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Auto Start Options */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Automation</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-700">
                <span className="text-xs font-bold text-gray-300">Auto-start Breaks</span>
                <button 
                  onClick={() => handleChange('autoStartBreaks', !localSettings.autoStartBreaks)}
                  className={`w-12 h-6 rounded-full transition-all duration-500 relative ${localSettings.autoStartBreaks ? 'bg-orange-600' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${localSettings.autoStartBreaks ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-700">
                <span className="text-xs font-bold text-gray-300">Auto-start Pomodoros</span>
                <button 
                   onClick={() => handleChange('autoStartPomodoros', !localSettings.autoStartPomodoros)}
                  className={`w-12 h-6 rounded-full transition-all duration-500 relative ${localSettings.autoStartPomodoros ? 'bg-orange-600' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${localSettings.autoStartPomodoros ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-gray-700/50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all border border-transparent hover:border-gray-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20 border border-orange-400"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

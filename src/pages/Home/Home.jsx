import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePomodoro } from "../../hooks/usePomodoro";
import { useTasks } from "../../context/TaskContext";
import { useSettings } from "../../context/SettingsContext";
import TaskList from "../../components/TaskList/TaskList";
import SettingsModal from "../../components/Settings/SettingsModal";
import {
  RefreshCw,
  Play,
  Pause,
  X,
  Calendar,
  Trash2,
  Settings as SettingsIcon,
} from "lucide-react";

// Home Component
const Home = () => {
  const audioRef = useRef(null);
  const { activeTask, incrementPomodoro } = useTasks();
  const { settings } = useSettings();

  const [history, setHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // Refs to avoid circular dependency in handleFinish
  const activeTaskRef = useRef(activeTask);
  const formattedTimeRef = useRef("");

  useEffect(() => { activeTaskRef.current = activeTask; }, [activeTask]);

  const handleFinish = useCallback((finishedMode) => {
    // 1. Play Sound
    if (audioRef.current && (hasInteracted || isAudioUnlocked)) {
      if (settings.soundEnabled) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.error("Completion audio failed:", e));
        
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.loop = false;
          }
        }, 10000);
      }
    }

    // 2. Record History (Work Sessions Only)
    if (finishedMode === 'work') {
      const currentTask = activeTaskRef.current;
      if (currentTask) {
        incrementPomodoro(currentTask.id);
      }

      const currentDate = new Date();
      const monthDay = `${currentDate.toLocaleDateString("en-US", { month: "short" })} ${currentDate.getDate()}`;
      
      const newEntry = { 
        storeTime: formattedTimeRef.current,
        date: monthDay, 
        time: currentDate.toLocaleTimeString(),
        sessionType: 'Work',
        taskTitle: currentTask?.title || 'Focus Session'
      };
      
      setHistory(prev => {
        const updated = [newEntry, ...prev];
        localStorage.setItem("timerHistory", JSON.stringify(updated));
        return updated;
      });
    }
  }, [hasInteracted, isAudioUnlocked, settings.soundEnabled, incrementPomodoro]);

  const {
    mode,
    timeLeft,
    formattedTime,
    isRunning,
    sessionsCompleted,
    start,
    stop,
    reset,
    skip,
    setMode,
    MODES,
  } = usePomodoro(handleFinish);

  // Sync formattedTime to Ref for history
  useEffect(() => { formattedTimeRef.current = formattedTime; }, [formattedTime]);

  // Load history from local storage on initial render
  useEffect(() => {
    const storedHistory = localStorage.getItem("timerHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleTestAlarm = () => {
    if (audioRef.current) {
      audioRef.current.loop = false;
      audioRef.current.play().catch(e => console.error("Test failed:", e));
    }
  };

  // Global listener to unlock audio on first interaction (Browser Autoplay Policy fix)
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current && !isAudioUnlocked) {
        // "Warm up" the audio element with a silent play
        audioRef.current.play()
          .then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsAudioUnlocked(true);
            setHasInteracted(true);
          })
          .catch(e => console.log("Unlock failed, waiting for user gesture:", e));
      }
    };

    window.addEventListener('mousedown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('mousedown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [isAudioUnlocked]);

  // Reset logic
  const handleReset = () => {
    reset();
  };

  // Clear individual history item
  const clearHistoryItem = (index) => {
    const updatedHistory = [...history];
    updatedHistory.splice(index, 1);
    setHistory(updatedHistory);
    localStorage.setItem("timerHistory", JSON.stringify(updatedHistory));
  };

  const handleStart = () => {
    start();
    setHasInteracted(true);
  };

  const getModeColor = () => {
    switch (mode) {
      case MODES.SHORT_BREAK: return 'from-emerald-400 via-teal-300 to-cyan-500';
      case MODES.LONG_BREAK: return 'from-blue-400 via-indigo-300 to-purple-500';
      default: return 'from-orange-400 via-red-400 to-pink-500';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case MODES.SHORT_BREAK: return 'Short Break';
      case MODES.LONG_BREAK: return 'Long Break';
      default: return 'Focus Session';
    }
  };

  return (
    <section className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center gap-12 p-4 md:p-10 lg:p-16 overflow-x-hidden transition-all duration-500">
      
      {/* Background Glow */}
      <div className={`fixed top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-1000 bg-gradient-to-br ${getModeColor()}`} />
      
      <div className="w-full max-w-6xl flex flex-col gap-10 md:gap-14 z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getModeColor()} shadow-2xl shadow-black/50`}>
              <SettingsIcon size={20} className="text-gray-900" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-[0.3em] italic text-gray-100">Tikkr</h1>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3.5 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group backdrop-blur-md"
          >
            <SettingsIcon size={22} className="text-gray-500 group-hover:text-orange-400 group-hover:rotate-90 transition-all duration-700" />
          </button>
        </div>

        {/* Main Content: Timer & Tasks (Side by Side) */}
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          {/* Timer Section */}
          <div className="flex-1 flex flex-col">
            <div className="w-full h-full backdrop-blur-2xl bg-gray-900/40 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              {/* Mode Switcher */}
              <div className="flex bg-black/40 p-1.5 rounded-[1.25rem] mb-12 border border-white/5 relative z-10 mx-auto w-full max-w-sm">
                <button
                  onClick={() => setMode(MODES.WORK)}
                  className={`flex-1 py-3 px-3 rounded-[0.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${mode === MODES.WORK ? 'bg-gray-800 text-orange-400 shadow-2xl' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  Focus
                </button>
                <button
                  onClick={() => setMode(MODES.SHORT_BREAK)}
                  className={`flex-1 py-3 px-3 rounded-[0.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${mode === MODES.SHORT_BREAK ? 'bg-gray-800 text-emerald-400 shadow-2xl' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  Short
                </button>
                <button
                  onClick={() => setMode(MODES.LONG_BREAK)}
                  className={`flex-1 py-3 px-3 rounded-[0.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${mode === MODES.LONG_BREAK ? 'bg-gray-800 text-blue-400 shadow-2xl' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  Long
                </button>
              </div>

              <div className="relative mb-12 text-center z-10">
                <h2 className="text-gray-500 text-[11px] font-black tracking-[0.4em] uppercase mb-6 opacity-40">
                  {getModeLabel()}
                </h2>
                <div className="flex justify-center">
                  <div className={`text-8xl md:text-[10rem] font-black text-center tracking-tighter bg-gradient-to-r ${getModeColor()} text-transparent bg-clip-text drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700`}>
                    {formattedTime}
                  </div>
                </div>

                {mode === MODES.WORK && (
                  <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="px-5 py-2 bg-black/40 rounded-full border border-white/5 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse" />
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest"> Focus Session #{sessionsCompleted + 1} </p>
                    </div>
                    
                    <div className={`mt-2 transition-all duration-700 px-6 py-3 rounded-2xl border border-white/5 bg-white/[0.02] ${activeTask ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2 text-center">Current Focus</p>
                      <p className={`text-base md:text-lg font-bold italic tracking-wide text-center px-4 transition-colors duration-500 ${activeTask ? 'text-orange-400' : 'text-gray-500'}`}>
                        {activeTask ? activeTask.title : 'Select a task to focus'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-5 relative z-10 max-w-sm mx-auto w-full">
                <button
                  onClick={handleReset}
                  className="flex flex-col items-center justify-center gap-3 bg-white/5 py-5 px-2 rounded-[2rem] hover:bg-white/10 transition-all duration-500 text-gray-600 border border-transparent hover:border-white/10 group active:scale-95"
                >
                  <RefreshCw size={22} className="group-hover:rotate-180 transition-transform duration-1000" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100">Reset</span>
                </button>
                
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className={`flex flex-col items-center justify-center gap-3 py-7 px-2 rounded-[2.5rem] transition-all duration-500 text-white border-b-4 border-black/20 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] scale-110 -translate-y-2 active:translate-y-0 active:scale-100
                      ${mode === MODES.WORK ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/40' : 
                        mode === MODES.SHORT_BREAK ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' : 
                        'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'}`}
                  >
                    <Play size={28} fill="currentColor" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Start</span>
                  </button>
                ) : (
                  <button
                    onClick={stop}
                    className="flex flex-col items-center justify-center gap-3 py-7 px-2 rounded-[2.5rem] hover:bg-gray-100/20 transition-all duration-500 text-white border-b-4 border-black/20 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] scale-110 -translate-y-2 active:translate-y-0 active:scale-100 bg-gray-100/10"
                  >
                    <Pause size={28} fill="currentColor" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Pause</span>
                  </button>
                )}

                <button
                  onClick={skip}
                  className="flex flex-col items-center justify-center gap-3 bg-white/5 py-5 px-2 rounded-[2rem] hover:bg-white/10 transition-all duration-500 text-gray-600 border border-transparent hover:border-white/10 group active:scale-95"
                >
                  <X size={22} className="group-hover:scale-125 transition-transform duration-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100">Skip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Task List Section */}
          <div className="lg:w-[400px] flex flex-col">
            <TaskList />
          </div>
        </div>

        {/* Activity Section (Bottom, Full Width) */}
        <div className="w-full backdrop-blur-2xl bg-gray-900/40 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                <Calendar size={22} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest italic text-gray-100">Session Activity</h2>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Your recent records</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-black/40 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest border border-white/5">
                Total: {history.length}
              </span>
            </div>
          </div>

          <div className="relative z-10">
            {history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="group flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.06] transition-all duration-500"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-3 h-3 rounded-full transition-all duration-700 ${entry.sessionType === 'Work' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} />
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-black text-gray-200 truncate max-w-[150px] uppercase tracking-wide">
                          {entry.taskTitle || 'Focus Session'}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-60">
                            {entry.date}
                          </span>
                          <span className="w-1 h-1 bg-gray-800 rounded-full" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-60">
                            {entry.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => clearHistoryItem(index)}
                      className="p-3 text-gray-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-gray-700 border border-dashed border-gray-800 rounded-[2.5rem]">
                <div className="w-20 h-20 rounded-[2rem] bg-black/20 flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                  <Calendar size={28} className="opacity-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Pioneer your first session</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onTestAlarm={handleTestAlarm}
      />

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      />
    </section>
  );
};

export default Home;
import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Plus, Trash2, CheckCircle, Circle, Play, MoreVertical } from 'lucide-react';

const TaskList = () => {
  const { tasks, addTask, deleteTask, toggleComplete, activateTask, activeTaskId } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [estPomodoros, setEstPomodoros] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle.trim(), estPomodoros);
    setNewTaskTitle('');
    setEstPomodoros(1);
    setIsAdding(false);
  };

  return (
    <div className="w-full h-full backdrop-blur-2xl bg-gray-900/40 p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-white/5 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-200">Focus Tasks</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-gray-700/50 rounded-xl text-orange-400 hover:bg-gray-700 transition-colors border border-gray-600"
        >
          <Plus size={18} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-900/50 p-4 rounded-2xl border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <input
            autoFocus
            type="text"
            placeholder="What are you working on?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-transparent text-gray-200 placeholder-gray-500 border-b border-gray-700 pb-2 mb-4 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Est Pomodoros</span>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setEstPomodoros(Math.max(1, estPomodoros - 1))}
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all active:scale-90"
                > - </button>
                <span className="text-sm font-black text-orange-400 w-4 text-center">{estPomodoros}</span>
                <button 
                   type="button"
                  onClick={() => setEstPomodoros(Math.min(10, estPomodoros + 1))}
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all active:scale-90"
                > + </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 text-[10px] font-black text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
              > Cancel </button>
              <button 
                type="submit"
                className="flex-[2] py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20 active:scale-95 border border-orange-400"
              > Add Task </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3 max-h-[300px] md:max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => activateTask(task.id)}
              className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl border transition-all duration-500 cursor-pointer relative overflow-hidden
                ${task.id === activeTaskId 
                  ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_10px_30px_rgba(249,115,22,0.1)]' 
                  : 'bg-gray-900/30 border-gray-800 hover:border-gray-700 hover:bg-gray-800/40'}`}
            >
              {task.id === activeTaskId && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
              )}

              <div className="flex items-center gap-3 md:gap-4 relative z-10 w-full pr-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleComplete(task.id); }}
                  className={`transition-all duration-300 transform hover:scale-125 ${task.isCompleted ? 'text-emerald-500' : 'text-gray-600 group-hover:text-gray-400'}`}
                >
                  {task.isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
                </button>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-[13px] md:text-sm font-black transition-all truncate tracking-tight ${task.isCompleted ? 'text-gray-600 line-through' : 'text-gray-100'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex gap-1.5">
                      {[...Array(task.estimatedPomodoros)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i < task.completedPomodoros ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-gray-800'}`} />
                      ))}
                    </div>
                    {task.id === activeTaskId && (
                      <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Active</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 relative z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  className="p-2 text-gray-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-700 border border-dashed border-gray-800 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Your task list is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;

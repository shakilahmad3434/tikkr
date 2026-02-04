import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tikkr_tasks');
    if (storedTasks) {
      const parsed = JSON.parse(storedTasks);
      setTasks(parsed);
      const active = parsed.find(t => t.isActive);
      if (active) setActiveTaskId(active.id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tikkr_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title, estimatedPomodoros = 1) => {
    const newTask = {
      id: crypto.randomUUID(),
      title,
      estimatedPomodoros,
      completedPomodoros: 0,
      isCompleted: false,
      isActive: tasks.length === 0, // First task is active by default
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    if (tasks.length === 0) setActiveTaskId(newTask.id);
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const toggleComplete = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  const activateTask = (id) => {
    setTasks(prev => prev.map(task => ({
      ...task,
      isActive: task.id === id
    })));
    setActiveTaskId(id);
  };

  const incrementPomodoro = (id) => {
    if (!id) return;
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completedPomodoros: task.completedPomodoros + 1 } : task
    ));
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <TaskContext.Provider value={{
      tasks,
      activeTask,
      activeTaskId,
      addTask,
      updateTask,
      deleteTask,
      toggleComplete,
      activateTask,
      incrementPomodoro
    }}>
      {children}
    </TaskContext.Provider>
  );
};

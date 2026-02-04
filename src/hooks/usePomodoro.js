import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

const MODES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

export const usePomodoro = () => {
  const { settings } = useSettings();
  
  const [mode, setMode] = useState(MODES.WORK);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef(null);

  // Update timeLeft when settings change if timer is not running
  useEffect(() => {
    if (!isRunning) {
      if (mode === MODES.WORK) setTimeLeft(settings.workDuration * 60);
      else if (mode === MODES.SHORT_BREAK) setTimeLeft(settings.shortBreakDuration * 60);
      else if (mode === MODES.LONG_BREAK) setTimeLeft(settings.longBreakDuration * 60);
    }
  }, [settings, mode, isRunning]);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setTimeLeft(
      newMode === MODES.WORK 
        ? settings.workDuration * 60
        : newMode === MODES.SHORT_BREAK 
          ? settings.shortBreakDuration * 60
          : settings.longBreakDuration * 60
    );
    setIsRunning(false);
    setIsFinished(false);
  }, [settings]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    setIsFinished(true);

    if (mode === MODES.WORK) {
      const nextSessionCount = sessionsCompleted + 1;
      setSessionsCompleted(nextSessionCount);
      
      const isLongBreak = nextSessionCount % settings.sessionsBeforeLongBreak === 0;
      const nextMode = isLongBreak ? MODES.LONG_BREAK : MODES.SHORT_BREAK;
      
      if (settings.autoStartBreaks) {
        setTimeout(() => switchMode(nextMode), 100);
        setTimeout(() => setIsRunning(true), 200);
      } else {
        switchMode(nextMode);
      }
    } else {
      if (settings.autoStartPomodoros) {
        setTimeout(() => switchMode(MODES.WORK), 100);
        setTimeout(() => setIsRunning(true), 200);
      } else {
        switchMode(MODES.WORK);
      }
    }
  }, [mode, sessionsCompleted, settings, switchMode]);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        handleSessionComplete();
        return 0;
      }
      return prev - 1;
    });
  }, [handleSessionComplete]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, tick]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(
      mode === MODES.WORK 
        ? settings.workDuration 
        : mode === MODES.SHORT_BREAK 
          ? settings.shortBreakDuration 
          : settings.longBreakDuration
    );
  };

  const skip = () => {
    handleSessionComplete();
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return {
    mode,
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    sessionsCompleted,
    isFinished,
    start,
    stop,
    reset,
    skip,
    setMode: switchMode,
    MODES,
  };
};

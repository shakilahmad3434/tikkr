import { useState, useEffect } from "react";

export const useTimer = (initialMinutes  = 1) => {
  const initialTime = initialMinutes * 60 * 1000; // 45 minutes in milliseconds
  const [time, setTime] = useState(initialTime); // time in milliseconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && time > 0) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setTime((prev) => {
          const newTime = initialTime - elapsed;
          return newTime > 0 ? newTime : 0;
        });
      }, 10); // Update every 10 milliseconds
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  // Format time into a readable string (HH:MM:SS:MS)
  const formatTime = () => {
    const milliseconds = Math.floor((time % 1000) / 10); // 0-99
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const isFinished = time <= 0;

  return { 
    time, // raw milliseconds remaining
    formattedTime: formatTime(), // formatted string
    start,
    stop,
    reset,
    isFinished, // boolean indicating if timer has reached zero,
    isRunning
  };
};
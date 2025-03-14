import { useState, useEffect } from "react";

export const useTimer = () => {
  const [time, setTime] = useState(0); // time in milliseconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      const startTime = Date.now() - time;
      interval = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10); // Update every 10 milliseconds
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTime(0);
  };

  // Format time into a readable string (HH:MM:SS:MS)
  const formatTime = () => {
    const milliseconds = Math.floor((time % 1000)/ 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return { 
    time: time, // raw milliseconds
    formattedTime: formatTime(), // formatted string
    start, 
    stop, 
    reset 
  };
};
import React from "react";

const convertToSeconds = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:` +
         `${String(minutes).padStart(2, '0')}:` +
         `${String(secs).padStart(2, '0')}`;
};

export const useTimer = () => {
  const [initialTimeStr, setInitialTimeStr] = React.useState("00:10:00");
  const initialSeconds = convertToSeconds(initialTimeStr);
  const [timeLeft, setTimeLeft] = React.useState(initialSeconds);
  const [isRunning, setisRunning] = React.useState(false);
  const timeLeftRef = React.useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const intervalRef = React.useRef(null);

  const start = () => {
    setisRunning(true);
    tick();
  };

  const stop = () => {
    setisRunning(false);
    clearTimeout(intervalRef.current);
  };

  const reset = () => {
    setTimeLeft(initialSeconds);
    setisRunning(false);
    clearTimeout(intervalRef.current);
    setInitialTimeStr("00:00:00")
  };

  const setTime = (newTimeStr) => {
    setInitialTimeStr(newTimeStr);
    setTimeLeft(convertToSeconds(newTimeStr));
  };

  const tick = () => {
    if (isRunning && timeLeftRef.current > 0) {
      setTimeLeft(timeLeftRef.current - 1);
      timeLeftRef.current = timeLeftRef.current - 1;
      intervalRef.current = setTimeout(tick, 1000);
    } else {
      clearTimeout(intervalRef.current);
    }
  };

  React.useEffect(() => {
    if (isRunning) {
      tick();
    }
    return () => clearTimeout(intervalRef.current);
  }, [isRunning]);

  React.useEffect(() => {
    setTimeLeft(convertToSeconds(initialTimeStr));
  }, [initialTimeStr]);

  const formattedTime = formatTime(timeLeft);
  const isFinished = timeLeft <= 0;

  return { time: timeLeft, formattedTime, start, stop, reset, isFinished, isRunning, setTime };
};
import React from 'react';
import { useTimer } from './Timer';

const TimerComponent = () => {
  const { formattedTime, start, stop, reset, isFinished, isRunning } = useTimer();

  return (
    <div>
      <h1>{formattedTime}</h1>
      {isFinished && <p>Timer Finished!</p>}
      <button onClick={start} disabled={isRunning || isFinished}>
        Start
      </button>
      <button onClick={stop} disabled={!isRunning}>
        Stop
      </button>
      <button onClick={reset}>
        Reset
      </button>
    </div>
  );
};

export default TimerComponent;
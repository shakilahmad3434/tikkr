import React, { useState, useEffect, useRef } from 'react';
import { Bell, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

function TimerComponents() {
  const [timeInput, setTimeInput] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  
  const audioRef = useRef(null);
  const alarmTimeoutRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setShowTimeUp(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Play alarm for 5 seconds
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      alarmTimeoutRef.current = setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
        setShowTimeUp(false);
      }, 5000);
    }
  };

  const startTimer = () => {
    if (timeLeft === 0) {
      const totalSeconds = 
        timeInput.hours * 3600 + 
        timeInput.minutes * 60 + 
        timeInput.seconds;
      setTimeLeft(totalSeconds);
    }
    setIsRunning(true);
    setShowTimeUp(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setShowTimeUp(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (!timeLeft) return 'bg-gray-200';
    const progress = (timeLeft / (timeInput.hours * 3600 + timeInput.minutes * 60 + timeInput.seconds)) * 100;
    if (progress <= 10) return 'bg-red-500';
    if (progress <= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Countdown Timer</h1>
        
        {/* Time Input Fields */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['hours', 'minutes', 'seconds'].map((unit) => (
            <div key={unit}>
              <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                {unit}
              </label>
              <input
                type="number"
                min="0"
                max={unit === 'hours' ? '23' : '59'}
                value={timeInput[unit]}
                onChange={(e) => 
                  setTimeInput((prev) => ({
                    ...prev,
                    [unit]: Math.min(
                      parseInt(e.target.value) || 0,
                      unit === 'hours' ? 23 : 59
                    ),
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isRunning}
              />
            </div>
          ))}
        </div>

        {/* Timer Display */}
        <div className="text-6xl font-mono text-center mb-6">
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${getProgressColor()}`}
            style={{
              width: `${timeLeft ? (timeLeft / (timeInput.hours * 3600 + timeInput.minutes * 60 + timeInput.seconds)) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={!timeInput.hours && !timeInput.minutes && !timeInput.seconds}
            >
              <Play size={20} /> Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Pause size={20} /> Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <RotateCcw size={20} /> Reset
          </button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="text-gray-600 hover:text-gray-800"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1"
          />
        </div>

        {/* Time Up Notification */}
        {showTimeUp && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-xl shadow-xl text-center">
              <Bell className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold mb-4">Time's Up!</h2>
              <button
                onClick={() => setShowTimeUp(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
          loop
        />
      </div>
    </div>
  );
}

export default TimerComponents;
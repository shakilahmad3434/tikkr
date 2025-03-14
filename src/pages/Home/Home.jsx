import React, { useState, useEffect, useRef } from 'react';

const Timer = () => {
  const [initialTime] = useState(5); // Initial time in seconds
  const [time, setTime] = useState(initialTime);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // Preload the audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

  useEffect(() => {
    let intervalId;

    if (isActive && time > 0) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
        // Calculate progress as a percentage of elapsed time
        setProgress(((initialTime - (time - 1)) / initialTime));
      }, 1000);
    } else if (time === 0 && isActive) {
      // When timer reaches zero, try to play audio
      if (audioRef.current && !isAudioPlaying) {
        playAudio();
      }
      setIsActive(false);
    }

    return () => clearInterval(intervalId);
  }, [time, initialTime, isActive, isAudioPlaying]);

  const playAudio = () => {
    if (audioRef.current) {
      // Store a promise of the play attempt
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAudioPlaying(true);
          })
          .catch(error => {
            console.error("Audio playback failed:", error);
            // Set up visual notification as fallback
            document.title = "⏰ Time's Up!";
          });
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      // Reset document title if it was changed
      document.title = "Timer";
    }
  };

  const startTimer = () => {
    setIsActive(true);
    // User interaction has occurred, so we can now play audio when needed
  };

  const resetTimer = () => {
    setTime(initialTime);
    setProgress(0);
    setIsActive(false);
    stopAudio();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const circleLength = 2 * Math.PI * 90; // Circle circumference

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <div className="relative">
        <svg className="w-[500px] h-[500px]" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#3a3f50"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#b1c5ff"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circleLength}
            strokeDashoffset={circleLength - progress * circleLength}
            transform="rotate(-90, 100, 100)"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-5xl font-bold">
          {formatTime(time)}
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-8 space-x-4">
        {!isActive && time === initialTime ? (
          <button 
            onClick={startTimer}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
          >
            Start Timer
          </button>
        ) : !isActive ? (
          <button 
            onClick={resetTimer}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Reset Timer
          </button>
        ) : (
          <button 
            onClick={resetTimer}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
          >
            Cancel
          </button>
        )}
        
        {isAudioPlaying && (
          <button 
            onClick={stopAudio}
            className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none"
          >
            Stop Sound
          </button>
        )}
      </div>

      {/* Audio Test Button - For Development */}
      <button 
        onClick={playAudio}
        className="mt-4 px-4 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
      >
        Test Sound
      </button>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        loop
      />
    </div>
  );
};

export default Timer;
import React, { useEffect, useRef, useState } from "react";
import { useTimer } from "../../components/Timer";
import {
  Clock,
  Bell,
  Calendar,
  Edit,
  RefreshCw,
  Play,
  Pause,
  X,
  Check,
} from "lucide-react";

// Timer Edit Modal Component
const TimerEditModal = ({ isOpen, onClose, onSave, initialTime }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Set initial values when modal opens

  useEffect(() => {
    if (isOpen && initialTime) {
      const [h, m, s] = initialTime.split(":").map(Number);
      setHours(h || 0);
      setMinutes(m || 0);
      setSeconds(s || 0);
    }
  }, [isOpen, initialTime]);

  const handleSave = () => {
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    onSave(formattedTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-teal-400">Set Timer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="flex justify-between items-center gap-4 mb-8">
          {/* Hours Input */}
          <div className="flex flex-col items-center">
            <label className="text-gray-400 mb-2">Hours</label>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setHours((prev) => Math.min(prev + 1, 99))}
                className="bg-gray-700 hover:bg-gray-600 w-12 h-8 rounded-t-lg flex items-center justify-center"
              >
                ▲
              </button>
              <input
                type="number"
                value={hours}
                onChange={(e) =>
                  setHours(
                    Math.min(Math.max(0, parseInt(e.target.value) || 0), 99)
                  )
                }
                className="bg-gray-900 text-center w-12 h-12 text-xl border-x border-gray-700"
                min="0"
                max="99"
              />
              <button
                onClick={() => setHours((prev) => Math.max(prev - 1, 0))}
                className="bg-gray-700 hover:bg-gray-600 w-12 h-8 rounded-b-lg flex items-center justify-center"
              >
                ▼
              </button>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-500">:</div>

          {/* Minutes Input */}
          <div className="flex flex-col items-center">
            <label className="text-gray-400 mb-2">Minutes</label>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setMinutes((prev) => Math.min(prev + 1, 59))}
                className="bg-gray-700 hover:bg-gray-600 w-12 h-8 rounded-t-lg flex items-center justify-center"
              >
                ▲
              </button>
              <input
                type="number"
                value={minutes}
                onChange={(e) =>
                  setMinutes(
                    Math.min(Math.max(0, parseInt(e.target.value) || 0), 59)
                  )
                }
                className="bg-gray-900 text-center w-12 h-12 text-xl border-x border-gray-700"
                min="0"
                max="59"
              />
              <button
                onClick={() => setMinutes((prev) => Math.max(prev - 1, 0))}
                className="bg-gray-700 hover:bg-gray-600 w-12 h-8 rounded-b-lg flex items-center justify-center"
              >
                ▼
              </button>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-500">:</div>

          {/* Seconds Input */}
          <div className="flex flex-col items-center">
            <label className="text-gray-400 mb-2">Seconds</label>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setSeconds((prev) => Math.min(prev + 1, 59))}
                className="bg-gray-700 hover:bg-gray-600 w-12 h-8 rounded-t-lg flex items-center justify-center"
              >
                ▲
              </button>
              <input
                type="number"
                value={seconds}
                onChange={(e) =>
                  setSeconds(
                    Math.min(Math.max(0, parseInt(e.target.value) || 0), 59)
                  )
                }
                className="bg-gray-900 text-center w-12 h-12 text-xl border-x border-gray-700"
                min="0"
                max="59"
              />
              <button
                onClick={() => setSeconds((prev) => Math.max(prev - 1, 0))}
                className="bg-gray-700 hover:bg-gray-600 w-12 h-8 rounded-b-lg flex items-center justify-center"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-700 py-2 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-teal-600 py-2 px-4 rounded-xl hover:bg-teal-500 transition-all duration-300 flex items-center gap-2"
          >
            <Check size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const audioRef = useRef(null);
  const {
    time,
    formattedTime,
    start,
    stop,
    reset,
    isFinished,
    isRunning,
    setTime,
  } = useTimer();

  const [storeTime, setStoreTime] = useState(formattedTime);
  const [date, setDate] = useState("");
  const [historyTime, setHistoryTime] = useState("");
  const [history, setHistory] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);

  // Load history from local storage on initial render
  useEffect(() => {
    const storedHistory = localStorage.getItem("timerHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Update storeTime when timer changes and is not running
  useEffect(() => {
    if (!isRunning) {
      setStoreTime(formattedTime);
    }
  }, [formattedTime, isRunning]);

  // Handle timer finish logic
  useEffect(() => {
    if (isFinished && audioRef.current && hasInteracted) {
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });

      // Capture current date and time
      const currentDate = new Date();
      const monthDay = `${currentDate.toLocaleDateString("en-US", {
        month: "short",
      })} ${currentDate.getDate()}`;
      
      const currentTime = currentDate.toLocaleTimeString();

      setDate(monthDay);
      setHistoryTime(currentTime);

      // Update history
      const newEntry = { storeTime, date: monthDay, time: currentTime };
      setHistory((prevHistory) => {
        const updatedHistory = [newEntry, ...prevHistory];
        localStorage.setItem("timerHistory", JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }

    // Auto-pause audio after 5 seconds
    const audioTimeout = setTimeout(() => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 5000);

    return () => clearTimeout(audioTimeout);
  }, [isFinished, storeTime, hasInteracted]);

  // Reset the timer and clear history
  const handleReset = () => {
    reset();
    setDate("");
    setHistoryTime("");
    setStoreTime("");
  };

  // Clear individual history item
  const clearHistoryItem = (index) => {
    const updatedHistory = [...history];
    updatedHistory.splice(index, 1);
    setHistory(updatedHistory);
    localStorage.setItem("timerHistory", JSON.stringify(updatedHistory));
  };

  // Handle saving the timer from the modal
  const handleSaveTimer = (newTime) => {
    setTime(newTime);
  };

  const handleStart = () => {
    start();
    setHasInteracted(true);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col md:flex-row justify-center items-center gap-8 p-6">
      {/* Timer Section */}
      <div className="w-full max-w-md backdrop-blur-sm bg-gray-800/60 p-8 rounded-3xl shadow-2xl border border-gray-700">
        <div className="relative mb-8">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-teal-500 rounded-full p-4 shadow-lg">
            <Clock size={32} className="text-gray-900" />
          </div>
          <h1 className="text-center text-2xl font-bold mt-4 mb-2 text-teal-400">
            Focus Timer
          </h1>
          <div className="flex justify-center">
            <div className="text-7xl font-bold text-center tracking-tight bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-500 text-transparent bg-clip-text">
              {formattedTime}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center justify-center gap-2 bg-gray-700 py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 text-teal-300 border border-gray-600"
          >
            <Edit size={18} /> Edit
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 bg-gray-700 py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 text-orange-300 border border-gray-600"
          >
            <RefreshCw size={18} /> Reset
          </button>
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center justify-center gap-2 bg-teal-600 py-3 px-4 rounded-xl hover:bg-teal-500 transition-all duration-300 text-white border border-teal-500"
            >
              <Play size={18} fill="currentColor" /> Start
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex items-center justify-center gap-2 bg-red-600 py-3 px-4 rounded-xl hover:bg-red-500 transition-all duration-300 text-white border border-red-500"
            >
              <Pause size={18} /> Stop
            </button>
          )}
        </div>
      </div>

      {/* Session History Section */}
      <div className="w-full max-w-md backdrop-blur-sm bg-gray-800/60 p-8 rounded-3xl shadow-2xl border border-gray-700 mt-8 md:mt-0">
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={24} className="text-blue-400" />
          <h2 className="text-2xl font-bold text-blue-400">Session History</h2>
        </div>
        <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {history.length > 0 ? (
            <ul className="space-y-3">
              {history.map((entry, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-700/50 rounded-xl border border-gray-600 hover:bg-gray-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-xl font-mono text-teal-300">
                        {entry.storeTime}
                      </span>
                      <span className="text-xs text-gray-400">{`${entry.date} · ${entry.time}`}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => clearHistoryItem(index)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Calendar size={40} className="mb-2 opacity-30" />
              <p>No history available</p>
            </div>
          )}
        </div>
      </div>

      {/* Timer Edit Modal */}
      <TimerEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveTimer}
        initialTime={formattedTime}
      />

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
      />

    </section>
  );
};

export default Home;
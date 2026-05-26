import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Zap, Activity } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { startGenerator, stopGenerator } from '../utils/api';

export default function GeneratorPanel({ onNewTransactions, tripId = null }) {
  const [isRunning, setIsRunning] = useState(false);
  const [batchSize, setBatchSize] = useState(3);
  const [intervalMs, setIntervalMs] = useState(2000);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    setLog((prev) => [
      { message, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);
  };

  const handleMessage = useCallback((msg) => {
    if (msg.type === 'NEW_TRANSACTIONS') {
      addLog(`+${msg.data.batch.length} transactions added (total: ${msg.data.total})`, 'success');
      onNewTransactions();
    } else if (msg.type === 'GENERATOR_STOPPED') {
      addLog('Generator stopped by server', 'warning');
      setIsRunning(false);
    } else if (msg.type === 'CONNECTED') {
      addLog('WebSocket connected ✓', 'info');
    }
  }, [onNewTransactions]);

  useWebSocket(handleMessage);

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await startGenerator(batchSize, intervalMs, tripId);
      if (result.started) {
        setIsRunning(true);
        addLog(`Generator started — ${batchSize} items every ${intervalMs / 1000}s${tripId ? ` for trip ${tripId}` : ''}`, 'success');
      } else {
        addLog(result.message, 'warning');
      }
    } catch (err) {
      addLog(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const result = await stopGenerator();
      if (result.stopped) {
        setIsRunning(false);
        addLog('Generator stopped', 'warning');
      }
    } catch (err) {
      addLog(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const logColors = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
        <h1 className="text-4xl text-white font-bold mb-2 flex items-center gap-3">
          <Zap className="w-9 h-9" /> Data Generator
        </h1>
        <p className="text-blue-100">
          Generate fake transactions automatically via WebSocket + GraphQL
          {tripId && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">Trip mode</span>}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-500" /> Generator Controls
          </h2>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8 ${
            isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isRunning ? 'Running' : 'Stopped'}
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Batch size: <span className="text-violet-600">{batchSize} transactions</span>
              </label>
              <input type="range" min="1" max="10" value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                disabled={isRunning} className="w-full accent-violet-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>10</span></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Interval: <span className="text-violet-600">{intervalMs / 1000}s</span>
              </label>
              <input type="range" min="500" max="10000" step="500" value={intervalMs}
                onChange={(e) => setIntervalMs(parseInt(e.target.value))}
                disabled={isRunning} className="w-full accent-violet-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0.5s</span><span>10s</span></div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleStart} disabled={isRunning || loading}
              className="flex-1 py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              <Play className="w-5 h-5" /> Start
            </button>
            <button onClick={handleStop} disabled={!isRunning || loading}
              className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              <Square className="w-5 h-5" /> Stop
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Live Feed</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            <AnimatePresence>
              {log.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">No events yet — start the generator</p>
              )}
              {log.map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 text-sm py-2 border-b border-gray-50">
                  <span className="text-gray-300 text-xs shrink-0 mt-0.5">{entry.time}</span>
                  <span className={`font-medium ${logColors[entry.type]}`}>{entry.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
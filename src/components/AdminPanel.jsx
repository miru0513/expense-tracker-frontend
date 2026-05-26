import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Activity } from 'lucide-react';
import * as api from '../utils/api';

const ACTION_COLORS = {
  LOGIN:                'bg-green-100 text-green-700',
  LOGOUT:               'bg-gray-100 text-gray-600',
  REGISTER:             'bg-blue-100 text-blue-700',
  CREATE_TRANSACTION:   'bg-violet-100 text-violet-700',
  UPDATE_TRANSACTION:   'bg-amber-100 text-amber-700',
  DELETE_TRANSACTION:   'bg-red-100 text-red-700',
  CREATE_TRIP:          'bg-teal-100 text-teal-700',
  UPDATE_TRIP:          'bg-amber-100 text-amber-700',
  DELETE_TRIP:          'bg-red-100 text-red-700',
  START_GENERATOR:      'bg-purple-100 text-purple-700',
  STOP_GENERATOR:       'bg-gray-100 text-gray-600',
  UPDATE_USER_ROLE:     'bg-orange-100 text-orange-700',
  DEACTIVATE_USER:      'bg-red-100 text-red-700',
};

export default function AdminPanel() {
  const [logs, setLogs]             = useState([]);
  const [suspicious, setSuspicious] = useState([]);
  const [activeTab, setActiveTab]   = useState('suspicious');
  const [loading, setLoading]       = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, suspiciousData] = await Promise.all([
        api.fetchLogs(200),
        api.fetchSuspiciousUsers(),
      ]);
      setLogs(logsData);
      setSuspicious(suspiciousData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleResolve = async (id) => {
    try {
      await api.resolveFlag(id);
      setSuspicious(prev => prev.map(s => s.id === id ? { ...s, resolved: true } : s));
    } catch (err) {
      console.error('Failed to resolve flag:', err);
    }
  };

  const formatTime = (iso) => new Date(iso).toLocaleString();
  const unresolvedCount = suspicious.filter(s => !s.resolved).length;

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-4xl text-white font-bold mb-2 flex items-center gap-3">
          <Shield className="w-9 h-9" /> Admin Panel
        </h1>
        <p className="text-blue-100">Security monitoring &amp; activity logs</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setActiveTab('suspicious')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'suspicious' ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'
          }`}>
          <AlertTriangle className="w-4 h-4" />
          Suspicious Users
          {unresolvedCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unresolvedCount}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('logs')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'logs' ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'
          }`}>
          <Activity className="w-4 h-4" /> Activity Logs ({logs.length})
        </button>
        <button onClick={loadData} disabled={loading}
          className="ml-auto px-4 py-2.5 rounded-xl font-semibold text-sm bg-white/20 text-white hover:bg-white/30 transition-all flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Suspicious Users Tab */}
      {activeTab === 'suspicious' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
          {suspicious.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No suspicious activity detected</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-4 text-left">Detected</th>
                    <th className="px-4 py-4 text-left">User</th>
                    <th className="px-4 py-4 text-left">Role</th>
                    <th className="px-4 py-4 text-left">Reason</th>
                    <th className="px-4 py-4 text-left">Count</th>
                    <th className="px-4 py-4 text-left">Status</th>
                    <th className="px-4 py-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suspicious.map((flag) => (
                    <tr key={flag.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatTime(flag.detectedAt)}</td>
                      <td className="px-4 py-3 font-medium text-gray-700 text-xs">{flag.userEmail}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{flag.userRole || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-xs truncate">{flag.reason}</td>
                      <td className="px-4 py-3 text-xs font-bold text-red-600">{flag.actionCount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${flag.resolved ? 'text-green-600' : 'text-red-500'}`}>
                          {flag.resolved ? '✓ Resolved' : '⚠ Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!flag.resolved && (
                          <button onClick={() => handleResolve(flag.id)}
                            className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-4 text-left">Timestamp</th>
                  <th className="px-4 py-4 text-left">User</th>
                  <th className="px-4 py-4 text-left">Role</th>
                  <th className="px-4 py-4 text-left">Action</th>
                  <th className="px-4 py-4 text-left">Details</th>
                  <th className="px-4 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No logs yet</td></tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatTime(log.timestamp)}</td>
                    <td className="px-4 py-3 font-medium text-gray-700 text-xs">{log.userEmail || '—'}</td>
                    <td className="px-4 py-3">
                      {log.userRole && (
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          log.userRole === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                        }`}>{log.userRole}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{log.details || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${log.success ? 'text-green-600' : 'text-red-500'}`}>
                        {log.success ? '✓ OK' : '✗ FAIL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

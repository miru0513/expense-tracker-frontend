import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Trash2, RefreshCw, Copy, Check, ShieldCheck, Clock, Globe } from 'lucide-react';
import * as api from '../utils/api';

const ALL_PERMISSIONS = [
  'transaction:create', 'transaction:read', 'transaction:update', 'transaction:delete',
  'trip:create', 'trip:read', 'trip:update', 'trip:delete',
  'stats:view', 'generator:start', 'generator:stop', 'user:manage',
];

const EXPIRY_OPTIONS = [
  { value: '1h',  label: '1 hour' },
  { value: '6h',  label: '6 hours' },
  { value: '24h', label: '24 hours' },
  { value: '7d',  label: '7 days' },
  { value: '30d', label: '30 days' },
];

export default function SessionPanel({ currentUser, isAdmin }) {
  const [sessions, setSessions]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState('sessions');
  const [copied, setCopied]             = useState(false);
  const [generatedToken, setGenerated]  = useState(null);
  const [tokenName, setTokenName]       = useState('');
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [expiresIn, setExpiresIn]       = useState('24h');
  const [generating, setGenerating]     = useState(false);
  const [error, setError]               = useState('');

  const userPerms = isAdmin ? ALL_PERMISSIONS : (currentUser?.role?.permissions?.map(p => p.name) || []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await api.fetchAllSessions() : await api.fetchMySessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (sessionId) => {
    try {
      await api.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Failed to revoke session:', err);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Revoke all your active sessions? You will need to log in again on all devices.')) return;
    await api.revokeAllSessions();
    setSessions([]);
  };

  const togglePerm = (p) =>
    setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    if (!tokenName.trim()) { setError('Token name is required'); return; }
    if (selectedPerms.length === 0) { setError('Select at least one permission'); return; }
    setGenerating(true);
    try {
      const result = await api.generateToken(tokenName.trim(), selectedPerms, expiresIn);
      setGenerated(result);
      setTokenName('');
      setSelectedPerms([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (iso) => new Date(iso).toLocaleString();
  const timeLeft = (iso) => {
    const ms = new Date(iso) - Date.now();
    if (ms <= 0) return 'Expired';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-4xl text-white font-bold mb-2 flex items-center gap-3">
          <Key className="w-9 h-9" /> Sessions & Tokens
        </h1>
        <p className="text-blue-100">Manage active sessions and generate scoped API tokens</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setActiveTab('sessions')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'sessions' ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'
          }`}>
          Active Sessions ({sessions.length})
        </button>
        <button onClick={() => setActiveTab('generator')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'generator' ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'
          }`}>
          <Key className="w-4 h-4" /> Generate Token
        </button>
        <button onClick={load} disabled={loading}
          className="ml-auto px-4 py-2.5 rounded-xl font-semibold text-sm bg-white/20 text-white hover:bg-white/30 transition-all flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
        {activeTab === 'sessions' && sessions.length > 0 && (
          <button onClick={handleRevokeAll}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-red-500/80 text-white hover:bg-red-600 transition-all flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Revoke All
          </button>
        )}
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {sessions.length === 0 ? (
            <div className="bg-white rounded-[2rem] shadow-xl py-16 text-center">
              <ShieldCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No active sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <motion.div key={s.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-gray-800">{s.name}</span>
                      {isAdmin && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                          uid: {s.userId.slice(0, 8)}…
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Expires {timeLeft(s.expiresAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Created {fmt(s.createdAt)}
                      </span>
                      {s.ipAddress && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {s.ipAddress}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(s.permissions || []).map(p => (
                        <span key={p} className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => handleRevoke(s.id)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold">
                    <Trash2 className="w-4 h-4" /> Revoke
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Token Generator Tab */}
      {activeTab === 'generator' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Form */}
          <div className="bg-white rounded-[2rem] shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-violet-500" /> New Scoped Token
            </h2>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Token name</label>
                <input value={tokenName} onChange={e => setTokenName(e.target.value)}
                  placeholder="e.g. Mobile app, CI pipeline…"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Permissions <span className="text-gray-400 font-normal">(select a subset of your own)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {userPerms.map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={selectedPerms.includes(p)} onChange={() => togglePerm(p)}
                        className="accent-violet-600 w-4 h-4" />
                      <span className="text-xs text-gray-600 group-hover:text-gray-900">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Expires in</label>
                <select value={expiresIn} onChange={e => setExpiresIn(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
                  {EXPIRY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button type="submit" disabled={generating}
                className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                <Key className="w-4 h-4" />
                {generating ? 'Generating…' : 'Generate Token'}
              </button>
            </form>
          </div>

          {/* Result */}
          <div className="bg-white rounded-[2rem] shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Generated Token</h2>

            <AnimatePresence mode="wait">
              {!generatedToken ? (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <Key className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Fill in the form and click Generate Token</p>
                  </div>
                </div>
              ) : (
                <motion.div key={generatedToken.token} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{generatedToken.name}</span>
                    <span className="text-xs text-gray-400">· expires {fmt(generatedToken.expiresAt)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {generatedToken.permissions.map(p => (
                      <span key={p} className="text-[11px] px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full font-medium">{p}</span>
                    ))}
                  </div>

                  <div className="relative">
                    <textarea readOnly value={generatedToken.token} rows={5}
                      className="w-full font-mono text-[11px] bg-gray-50 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none text-gray-700 break-all" />
                    <button onClick={copyToken}
                      className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>

                  <p className="text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
                    Copy this token now — it will not be shown again. Use it in the <code>Authorization: Bearer &lt;token&gt;</code> header.
                  </p>

                  <button onClick={() => setGenerated(null)}
                    className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold">
                    Generate another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
